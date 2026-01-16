import { Link } from '../models/Link.js';
import { redis } from '../config/redis.js';
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js'; // ✅ Correct Import

// --- 1. CREATE LINK ---
export const shortenUrl = async (req, res) => {
    try {
        const { url, userId, password, expiresAt, customAlias } = req.body;
        if(!url) return res.status(400).json({ error: "URL is required" });

        if (customAlias) {
            const exists = await Link.findOne({ shortCode: customAlias });
            if (exists) return res.status(409).json({ error: "Alias is already taken" });
        }

        let hashedPassword = null;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        const link = await Link.create({
            originalUrl: url,
            shortCode: customAlias || undefined,
            userId: userId || 'anonymous',
            password: hashedPassword,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            visitHistory: []
        });

        if (global.redisClient) await redis.set(`link:${link.shortCode}`, url, 'EX', 86400);
        res.status(201).json(link);
    } catch (err) {
        console.error("Shorten Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- 2. HANDLE REDIRECT (FIXED DATA CAPTURE) ---
export const redirectUrl = async (req, res) => {
    const { code } = req.params;
    const { password } = req.query;
    const isApiCall = req.headers['accept']?.includes('application/json');

    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).send("Link Not Found");

        if (link.expiresAt && new Date() > link.expiresAt) return res.status(410).send("Expired");

        if (link.password) {
            if (!password) return res.redirect(`${process.env.CLIENT_URL}?gate=${code}`);
            const isValid = await bcrypt.compare(password, link.password);
            if (!isValid) return res.status(401).json({ error: "Invalid Password" });
        }

        // --- 🔍 ROBUST DATA CAPTURE ---

        // 1. Get IP (Handle Proxies like Render/Vercel)
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip && typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        // 2. Parse User Agent (The Fix)
        const uaString = req.headers['user-agent'] || '';
        const parser = new UAParser(uaString);
        const result = parser.getResult();

        // 3. Get Location
        const geo = geoip.lookup(ip) || {};

        // 4. Console Log for Debugging (Check Render Logs!)
        console.log(`[HIT] Code: ${code} | IP: ${ip} | OS: ${result.os.name} | Device: ${result.device.type}`);

        // 5. Safe Push to DB
        if (!link.visitHistory) link.visitHistory = [];

        link.clicks++;
        link.visitHistory.push({
            timestamp: new Date(),
            ip: ip,
            country: geo.country || 'Unknown',
            city: geo.city || 'Unknown',
            os: result.os.name || 'Unknown', // ✅ Fixed
            browser: result.browser.name || 'Unknown', // ✅ Fixed
            device: result.device.type || 'Desktop' // ✅ Fixed (Libraries return undefined for Desktop)
        });

        await link.save();

        if (isApiCall) return res.json({ url: link.originalUrl });
        return res.redirect(link.originalUrl);

    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).send("Server Error");
    }
};

// --- 3. GET STATS ---
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const links = await Link.find({ userId }).sort({ createdAt: -1 });
        res.json(links);
    } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
};

// --- 4. GET ANALYTICS ---
export const getLinkAnalytics = async (req, res) => {
    const { code } = req.params;
    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).json({ error: "Not found" });

        const history = link.visitHistory || [];

        const agg = (field) => {
            const counts = {};
            history.forEach(v => {
                const key = v[field] || 'Unknown';
                counts[key] = (counts[key] || 0) + 1;
            });
            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        };

        const timeline = [];
        const dateMap = {};
        history.forEach(v => {
            if(v.timestamp) {
                const date = new Date(v.timestamp).toISOString().split('T')[0];
                dateMap[date] = (dateMap[date] || 0) + 1;
            }
        });
        Object.keys(dateMap).forEach(date => timeline.push({ name: date, value: dateMap[date] }));

        res.json({
            totalClicks: link.clicks,
            countries: agg('country'),
            os: agg('os'),
            browsers: agg('browser'),
            timeline: timeline
        });
    } catch (err) {
        console.error("Analytics Error", err);
        res.json({ totalClicks: 0, countries: [], os: [], browsers: [], timeline: [] });
    }
};