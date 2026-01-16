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
        country: String,
        city: String,
        os: String,
        device: String,
        browser: String
    }],
    // 👆 END OF NEW SECTION 👆

}, { timestamps: true });

export const Link = mongoose.model('Link', linkSchema);