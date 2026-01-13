import { Link } from '../models/Link.js';
import { redis } from '../config/redis.js'; // Ensure this path matches your redis config
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

// --- 1. CREATE LINK (Shorten) ---
export const shortenUrl = async (req, res) => {
    try {
        const { url, userId, password, expiresAt, customAlias } = req.body;

        if(!url) return res.status(400).json({ error: "URL is required" });

        // A. Custom Alias Check
        if (customAlias) {
            const exists = await Link.findOne({ shortCode: customAlias });
            if (exists) return res.status(409).json({ error: "Alias is already taken" });
        }

        // B. Password Hashing
        let hashedPassword = null;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        // C. Database Creation
        const link = await Link.create({
            originalUrl: url,
            shortCode: customAlias || undefined, // If null, Mongoose generates random code
            userId: userId || 'anonymous',
            password: hashedPassword,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        // D. Cache for Performance (24 hours)
        // Note: If you disabled Redis, comment this line out.
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

    // Detect if the request is from our own App (verifying password) or a Browser (visiting link)
    const isApiCall = req.headers['accept']?.includes('application/json');

    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).send("Link Not Found");

        // A. Expiry Check
        if (link.expiresAt && new Date() > link.expiresAt) {
            return res.status(410).send("This link has expired.");
        }

        // B. Password Protection
        if (link.password) {
            // Case 1: Browser visits directly -> Bounce to Frontend Gate
            if (!password) {
                return res.redirect(`${process.env.CLIENT_URL}?gate=${code}`);
            }

            // Case 2: Frontend verifies password -> Check Hash
            const isValid = await bcrypt.compare(password, link.password);
            if (!isValid) return res.status(401).json({ error: "Invalid Password" });
        }

        // C. Real Analytics Tracking
        // Get Real IP (Accounts for proxies/load balancers)
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

        // Lookup Location & Device
        const geo = geoip.lookup(ip) || {};
        const ua = new UAParser(req.headers['user-agent']);
        const device = ua.getDevice();
        const os = ua.getOS();
        const browser = ua.getBrowser();

        // Log the Hit
        // Note: 'geo.country' will be null on Localhost. This is correct behavior.
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

        // D. Final Destination
        if (isApiCall) {
            return res.json({ url: link.originalUrl }); // Send data to App
        } else {
            return res.redirect(link.originalUrl); // Send user to Website
        }

    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).send("Server Error");
    }
};

// --- 3. GET STATS (Dashboard) ---
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const links = await Link.find({ userId }).sort({ createdAt: -1 });
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: "Fetch Error" });
    }
};

// --- 4. GET DEEP ANALYTICS (HUD) ---
export const getLinkAnalytics = async (req, res) => {
    const { code } = req.params;
    try {
        const link = await Link.findOne({ shortCode: code });
        if (!link) return res.status(404).json({ error: "Not found" });

        // Aggregation Helper
        const agg = (field) => {
            const counts = {};
            link.visitHistory.forEach(v => {
                const key = v[field] || 'Unknown';
                counts[key] = (counts[key] || 0) + 1;
            });
            return counts;
        };

        // Timeline Helper
        const timeline = {};
        link.visitHistory.forEach(v => {
            const date = new Date(v.timestamp).toLocaleDateString();
            timeline[date] = (timeline[date] || 0) + 1;
        });

        res.json({
            totalClicks: link.clicks,
            countries: agg('country'),
            os: agg('os'),
            browsers: agg('browser'),
            timeline: timeline
        });
    } catch (err) {
        res.status(500).json({ error: "Analytics Error" });
    }
};