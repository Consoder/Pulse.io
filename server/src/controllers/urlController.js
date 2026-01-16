import { Link } from '../models/Link.js';
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

// ✅ Helper to generate random 6-char code
const generateShortCode = () => {
    return crypto.randomBytes(4).toString('hex').slice(0, 6);
};

// --- 1. CREATE LINK ---
export const shortenUrl = async (req, res) => {
    try {
        const { url, userId, password, expiresAt, customAlias } = req.body;
        if(!url) return res.status(400).json({ error: "URL is required" });

        let finalShortCode = customAlias;

        // If no alias, generate one
        if (!finalShortCode) {
            finalShortCode = generateShortCode();
            // Ensure uniqueness (simple check)
            let exists = await Link.findOne({ shortCode: finalShortCode });
            while (exists) {
                finalShortCode = generateShortCode();
                exists = await Link.findOne({ shortCode: finalShortCode });
            }
        } else {
            // Check custom alias availability
            const exists = await Link.findOne({ shortCode: customAlias });
            if (exists) return res.status(409).json({ error: "Alias is already taken" });
        }

        let hashedPassword = null;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        const link = await Link.create({
            originalUrl: url,
            shortCode: finalShortCode, // ✅ Now always has a value
            userId: userId || 'anonymous',
            password: hashedPassword,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            visitHistory: []
        });

        res.status(201).json(link);
    } catch (err) {
        console.error("Shorten Error:", err);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
};

// --- 2. HANDLE REDIRECT ---
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

        // --- ANALYTICS ---
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip && typeof ip === 'string') ip = ip.split(',')[0].trim();

        const geo = geoip.lookup(ip) || {};
        const ua = new UAParser(req.headers['user-agent']);
        const result = ua.getResult();

        if (!link.visitHistory) link.visitHistory = [];

        link.clicks++;
        link.visitHistory.push({
            timestamp: new Date(),
            ip: ip,
            country: geo.country || 'Unknown',
            city: geo.city || 'Unknown',
            os: result.os.name || 'Unknown',
            device: result.device.type || 'Desktop',
            browser: result.browser.name || 'Unknown'
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
        const links = await Link.find({ userId: req.params.userId }).sort({ createdAt: -1 });
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

        const dateMap = {};
        history.forEach(v => {
            if(v.timestamp) {
                const date = new Date(v.timestamp).toISOString().split('T')[0];
                dateMap[date] = (dateMap[date] || 0) + 1;
            }
        });
        const timeline = Object.keys(dateMap).map(date => ({ name: date, value: dateMap[date] }));

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