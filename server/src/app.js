import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// 👇 IMPORTING YOUR CONTROLLERS
import { shortenUrl, redirectUrl, getUserStats, getLinkAnalytics } from './controllers/urlController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({
    // Allow your Vercel frontend & Localhost
    origin: ["http://localhost:5173", "https://pulse-io-psi.vercel.app"],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// --- ROUTES ---
// 1. Create Link (Expects { url, customAlias, ... })
app.post('/api/shorten', shortenUrl);

// 2. Dashboard Stats (Get all links for a user)
app.get('/api/stats/:userId', getUserStats);

// 3. Analytics Data (Returns Arrays for Recharts)
app.get('/api/analytics/:code', getLinkAnalytics);

// 4. The Redirect / Password Gate
app.get('/:code', redirectUrl);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err));