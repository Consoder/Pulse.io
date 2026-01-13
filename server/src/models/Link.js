import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const LinkSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, default: () => nanoid(6), unique: true },

    // New Features
    userId: { type: String, index: true }, // Links to Google ID
    password: { type: String, default: null }, // Hashed password
    expiresAt: { type: Date, default: null }, // Auto-expiry
    clickLimit: { type: Number, default: null }, // Max clicks allowed

    // Analytics
    clicks: { type: Number, default: 0 },
    visitHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
        referer: String
    }],

    createdAt: { type: Date, default: Date.now }
});

// Auto-delete expired documents
LinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Link = mongoose.model('Link', LinkSchema);