import 'express-async-errors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import './worker.js';

import {
    shortenUrl,
    redirectUrl,
    getUserStats,
    getLinkAnalytics
} from './controllers/urlController.js';

dotenv.config();

// ✅ 1. Initialize App ONLY ONCE
const app = express();
const httpServer = createServer(app);

// ✅ 2. Setup CORS (Allow Vercel to talk to Backend)
app.use(cors({
    origin: [
        "http://localhost:5173",                // For local development
        "https://pulse-io-psi.vercel.app"       // ✅ YOUR REAL VERCEL DOMAIN
    ],
    credentials: true
}));

// ✅ 3. Setup Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://pulse-io-project.vercel.app"
        ],
        methods: ["GET", "POST"]
    }
});

// --- SECURITY MIDDLEWARE ---

// Helmet: Sets security headers (prevents sniffing)
app.use(helmet());

// Rate Limiting: Stops DDoS attacks and script abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // Apply to all API routes

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent overload

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (Cross-Site Scripting)
app.use(xss());

// --- ROUTES ---

app.post('/api/shorten', shortenUrl);
app.get('/api/stats/:userId', getUserStats);
app.get('/api/analytics/:code', getLinkAnalytics);
app.get('/:code', redirectUrl);

// Error Handling
app.use(errorHandler);

// Database & Server Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        logger.info('✅ MongoDB Connected (Secure Mode)');
        httpServer.listen(process.env.PORT || 5000, () => {
            logger.info(`🚀 Pulse Enterprise Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => logger.error("DB Connection Error:", err));

global.io = io;