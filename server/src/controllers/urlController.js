import { Link } from '../models/Link.js';
import { redis } from '../config/redis.js';
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

// --- 1. CREATE LINK (Shorten) ---
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
        });

        if (global.redisClient) {
            await redis.set(`link:${link.shortCode}`, url, 'EX', 86400);
        }

        res.status(201).json(link);
    } catch (err) {
        console.error("Shorten Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- 2. HANDLE REDIRECT (The Core Logic) ---
export const redirectUrl = async (req, res) => {
    const { code } = req.params;
    const { password } = req.query;
    const isApiCall = req.headers['accept']?.includes('application/json');

    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).send("Link Not Found");

        if (link.expiresAt && new Date() > link.expiresAt) {
            return res.status(410).send("This link has expired.");
        }

        if (link.password) {
            if (!password) {
                return res.redirect(`${process.env.CLIENT_URL}?gate=${code}`);
            }
            const isValid = await bcrypt.compare(password, link.password);
            if (!isValid) return res.status(401).json({ error: "Invalid Password" });
        }

        // --- 🔍 FIX: ROBUST IP DETECTION FOR RENDER ---
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        // Render/Vercel sends multiple IPs (Client, Proxy1, Proxy2). We want the FIRST one.
        if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        // Handle Localhost IPv6
        if (ip === '::1') ip = '127.0.0.1';

        // 🔍 DEBUG LOG: Check Render Logs to see this
        console.log(`📍 HIT: ${code} | IP: ${ip} | UA: ${req.headers['user-agent']}`);

        // --- ANALYTICS PARSING ---
        const geo = geoip.lookup(ip) || {};
        const ua = new UAParser(req.headers['user-agent']);
        const device = ua.getDevice();
        const os = ua.getOS();
        const browser = ua.getBrowser();

        // Push to DB
        link.clicks++;
        link.visitHistory.push({
            timestamp: new Date(),
            ip: ip,
            country: geo.country || 'Unknown',
            city: geo.city || 'Unknown',
            os: os.name || 'OS Unknown',
            browser: browser.name || 'Browser Unknown',
            device: device.type || 'Desktop'
        });

        await link.save();

        // Final Destination
        if (isApiCall) {
            return res.json({ url: link.originalUrl });
        } else {
            return res.redirect(link.originalUrl);
        }

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
    } catch (err) {
        res.status(500).json({ error: "Fetch Error" });
    }
};

// --- 4. GET DEEP ANALYTICS ---
export const getLinkAnalytics = async (req, res) => {
    const { code } = req.params;
    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).json({ error: "Not found" });

        const agg = (field) => {
            const counts = {};
            link.visitHistory.forEach(v => {
                const key = v[field] || 'Unknown';
                counts[key] = (counts[key] || 0) + 1;
            });
            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        };

        const timeline = [];
        const dateMap = {};

        link.visitHistory.forEach(v => {
            const date = new Date(v.timestamp).toISOString().split('T')[0];
            dateMap[date] = (dateMap[date] || 0) + 1;
        });

        Object.keys(dateMap).forEach(date => {
            timeline.push({ name: date, value: dateMap[date] });
        });

        res.json({
            totalClicks: link.clicks,
            countries: agg('country'),
            os: agg('os'),
            browsers: agg('browser'),
            timeline: timeline
        });
    } catch (err) {
        console.error("Analytics Error", err);
        res.status(500).json({ error: "Analytics Error" });
    }
};