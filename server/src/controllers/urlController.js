import { Link } from '../models/Link.js';
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import { redis } from '../config/redis.js';
import { analyticsQueue } from '../jobs/analyticsWorker.js';
import { isbot } from 'isbot';



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

        // 🚀 CACHE THE LINK IN REDIS (Expires in 7 days)
        try {
            await redis.set(`link:${finalShortCode}`, JSON.stringify(link), 'EX', 60 * 60 * 24 * 7);
        } catch (redisErr) {
            console.error("Redis Cache Error:", redisErr.message);
        }

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
        let link;
        // 🚀 FAST READ: Check Redis Cache First
        try {
            const cachedLink = await redis.get(`link:${code}`);
            if (cachedLink) link = JSON.parse(cachedLink);
        } catch (e) {} // Fallback to DB if Redis fails

        // 🐢 SLOW READ: Fallback to MongoDB
        if (!link) {
            link = await Link.findOne({ shortCode: code });
            if (!link) return res.status(404).send("Link Not Found");
            
            // Re-cache for next time
            try { await redis.set(`link:${code}`, JSON.stringify(link), 'EX', 60 * 60 * 24 * 7); } catch(e){}
        }

        if (link.expiresAt && new Date() > new Date(link.expiresAt)) return res.status(410).send("Expired");

        if (link.password) {
            if (!password) return res.redirect(`${process.env.CLIENT_URL}?gate=${code}`);
            const isValid = await bcrypt.compare(password, link.password);
            if (!isValid) return res.status(401).json({ error: "Invalid Password" });
        }

        // --- ASYNC ANALYTICS QUEUE ---
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip && typeof ip === 'string') ip = ip.split(',')[0].trim();

        const geo = geoip.lookup(ip) || {};
        const ua = new UAParser(req.headers['user-agent']);
        const result = ua.getResult();

        const userAgentString = req.headers['user-agent'] || '';
        const isBotCheck = isbot(userAgentString);
        const referrer = req.headers.referer || req.headers.referrer || 'Direct';
        const language = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'Unknown';
        
        const { utm_source, utm_medium, utm_campaign } = req.query;

        const analyticsData = {
            timestamp: new Date(),
            ip: ip,
            isBot: isBotCheck,
            country: geo.country || 'Unknown',
            city: geo.city || 'Unknown',
            os: result.os.name || 'Unknown',
            device: result.device.type || 'Desktop',
            browser: result.browser.name || 'Unknown',
            referrer: referrer,
            language: language,
            utm_source: utm_source || 'None',
            utm_medium: utm_medium || 'None',
            utm_campaign: utm_campaign || 'None'
        };

        // 🚀 FIRE AND FORGET: Push to background worker instead of waiting for MongoDB
        analyticsQueue.add('recordClick', { shortCode: code, analyticsData }).catch(err => console.error("Queue Error:", err));

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

        // Using MongoDB Aggregation to crunch data for high-scale links
        const pipeline = [
            { $match: { shortCode: code } },
            { $unwind: "$visitHistory" },
            {
                $facet: {
                    "totalClicks": [{ $count: "count" }],
                    "realHumans": [
                        { $match: { "visitHistory.isBot": false } },
                        { $count: "count" }
                    ],
                    "countries": [
                        { $group: { _id: "$visitHistory.country", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { value: -1 } }
                    ],
                    "os": [
                        { $group: { _id: "$visitHistory.os", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { value: -1 } }
                    ],
                    "browsers": [
                        { $group: { _id: "$visitHistory.browser", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { value: -1 } }
                    ],
                    "referrers": [
                        { $group: { _id: "$visitHistory.referrer", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { value: -1 } }
                    ],
                    "campaigns": [
                        { $match: { "visitHistory.utm_campaign": { $ne: "None" } } },
                        { $group: { _id: "$visitHistory.utm_campaign", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { value: -1 } }
                    ],
                    "timeline": [
                        {
                            $group: {
                                _id: { 
                                    $dateToString: { format: "%Y-%m-%d", date: "$visitHistory.timestamp" } 
                                },
                                value: { $sum: 1 }
                            }
                        },
                        { $project: { name: "$_id", value: 1, _id: 0 } },
                        { $sort: { name: 1 } }
                    ]
                }
            }
        ];

        const result = await Link.aggregate(pipeline);
        const data = result[0] || {};

        res.json({
            totalClicks: data.totalClicks?.[0]?.count || 0,
            realHumans: data.realHumans?.[0]?.count || 0,
            countries: data.countries || [],
            os: data.os || [],
            browsers: data.browsers || [],
            referrers: data.referrers || [],
            campaigns: data.campaigns || [],
            timeline: data.timeline || []
        });

    } catch (err) {
        console.error("Analytics Error", err);
        res.json({ totalClicks: 0, realHumans: 0, countries: [], os: [], browsers: [], referrers: [], campaigns: [], timeline: [] });
    }
};