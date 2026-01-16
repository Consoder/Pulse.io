import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { shortenUrl, redirectUrl, getUserStats, getLinkAnalytics } from './controllers/urlController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://pulse-io-psi.vercel.app"],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.post('/api/shorten', shortenUrl);
app.get('/api/stats/:userId', getUserStats);
app.get('/api/analytics/:code', getLinkAnalytics);
app.get('/:code', redirectUrl);

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err));