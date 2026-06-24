import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// 👇 IMPORTING YOUR CONTROLLERS
import { shortenUrl, redirectUrl, getUserStats, getLinkAnalytics } from './controllers/urlController.js';
import './jobs/analyticsWorker.js'; // 🚀 Boot background worker

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- DATABASE CONNECTION ---
let isConnected;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error("❌ DB Error:", err);
    }
};

// Vercel Serverless environment: we need to ensure DB is connected per-request
app.use(async (req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        await connectDB();
    }
    next();
});

// --- MIDDLEWARE ---
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// --- ROUTES ---
// 1. Create Link (Expects { url, customAlias, ... })
app.post('/api/shorten', shortenUrl);
app.post('/shorten', shortenUrl);

// 2. Dashboard Stats (Get all links for a user)
app.get('/api/stats/:userId', getUserStats);
app.get('/stats/:userId', getUserStats);

// 3. Analytics Data (Returns Arrays for Recharts)
app.get('/api/analytics/:code', getLinkAnalytics);
app.get('/analytics/:code', getLinkAnalytics);

// 4. The Redirect / Password Gate
app.get('/:code', redirectUrl);

// Only listen locally, Vercel provides its own port/server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    });
}

export default app;