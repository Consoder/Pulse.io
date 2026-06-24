import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    userId: { type: String, default: 'anonymous' },
    password: { type: String }, // Optional password
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date },

    // 👇 THIS WAS MISSING! ADD THIS EXACTLY 👇
    visitHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        isBot: { type: Boolean, default: false },
        country: String, // ISO Country Code for heatmaps
        city: String,
        os: String,
        device: String,
        browser: String,
        referrer: String,
        language: String,
        utm_source: String,
        utm_medium: String,
        utm_campaign: String
    }],
    // 👆 END OF NEW SECTION 👆

}, { timestamps: true });

export const Link = mongoose.model('Link', linkSchema);