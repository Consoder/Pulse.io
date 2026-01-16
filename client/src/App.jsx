// FORCE UPDATE V7 - DIAMOND EDITION (ANTI-CRASH)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import emailjs from '@emailjs/browser';
import {
    Activity, Zap, Command, Lock, Clock, Globe,
    X, ShieldCheck, Copy, Terminal, ChevronRight, ChevronLeft, Fingerprint,
    Loader2, Menu, ArrowRight, BarChart3
} from 'lucide-react';
import {
    AreaChart, Area, PieChart as RePieChart,
    Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }
const NOISE_SVG = "url('https://grainy-gradients.vercel.app/noise.svg')";

// --- COMPONENT START ---
export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home');
    const [url, setUrl] = useState('');
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [expiry, setExpiry] = useState('');
    const [createdLink, setCreatedLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userLinks, setUserLinks] = useState([]);
    const [selectedLinkStats, setSelectedLinkStats] = useState(null);
    const [gateCode, setGateCode] = useState('');
    const [gatePass, setGatePass] = useState('');

    // --- CONFIG ---
    const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const PROD_API = "https://pulse-backend-api.onrender.com";
    const API_BASE = IS_LOCALHOST ? "http://localhost:5000" : PROD_API;

    // --- GOOGLE AUTH ---
    const handleGoogleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            setUser(decoded);
            toast.success(`Access Granted`, { description: `Welcome, ${decoded.given_name}` });
            fetchUserLinks(decoded.sub);
        } catch (e) { toast.error("Login Failed"); }
    };

    // --- FETCH USER LINKS ---
    const fetchUserLinks = async (userId) => {
        try {
            const res = await axios.get(`${API_BASE}/api/stats/${userId}`);
            setUserLinks(res.data || []);
        } catch (e) { console.error(e); }
    };

    // --- 🛡️ CRASH-PROOF ANALYTICS FETCH (V7) ---
    const fetchAnalytics = async (shortCode) => {
        try {
            // 1. Fetch Data
            const res = await axios.get(`${API_BASE}/api/analytics/${shortCode}`);
            const data = res.data || {};

            // 2. Safe Helper (Never Crashes)
            const transform = (obj) => {
                if (!obj || typeof obj !== 'object') return [];
                return Object.entries(obj).map(([name, value]) => ({ name, value }));
            };

            // 3. Prepare Data with Defaults
            const rawTimeline = transform(data.timeline);
            // Sort timeline safely
            const sortedTimeline = rawTimeline.sort((a, b) => new Date(a.name) - new Date(b.name));

            // 4. Set State (React Update)
            setSelectedLinkStats({
                totalClicks: data.totalClicks || 0,
                countries: transform(data.countries),
                os: transform(data.os),
                browsers: transform(data.browsers),
                timeline: sortedTimeline
            });

        } catch (err) {
            console.error("Analytics Error:", err);
            // Instead of crashing, we show empty data
            setSelectedLinkStats({
                totalClicks: 0, countries: [], os: [], browsers: [], timeline: []
            });
            toast.error("No Data Yet", { description: "Click the link on mobile to generate data." });
        }
    };

    // --- SHORTEN URL ---
    const handleShorten = async () => {
        if (!url) return toast.error("Command Error", { description: "Target URL required" });
        setLoading(true);
        try {
            const payload = { url, userId: user?.sub || 'anonymous', password: password || null, expiresAt: expiry || null, customAlias: alias || null };
            const res = await axios.post(`${API_BASE}/api/shorten`, payload);
            const shortUrl = `${API_BASE}/${res.data.shortCode}`;
            navigator.clipboard.writeText(shortUrl);
            setCreatedLink(shortUrl);
            toast.success("Deployed", { description: "Link copied to clipboard." });
            if (user) fetchUserLinks(user.sub);
            setUrl(''); setPassword(''); setExpiry(''); setAlias('');
        } catch (err) { toast.error(err.response?.data?.error || "Deployment Failed"); }
        finally { setLoading(false); }
    };

    // --- UI HELPERS ---
    const Navbar = () => (
        <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4 mix-blend-difference text-white">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer font-bold text-2xl tracking-tighter hover:tracking-widest transition-all duration-300">
                    PULSE<span className="text-primary">.IO</span>
                </div>
                <div className="hidden md:flex items-center gap-8 font-mono text-sm">
                    {user ? (
                        <>
                            <button onClick={() => setView('home')} className={cn("hover:text-primary transition-colors", view === 'home' && "text-primary underline decoration-wavy")}>/CREATE</button>
                            <button onClick={() => setView('dashboard')} className={cn("hover:text-primary transition-colors", view === 'dashboard' && "text-primary underline decoration-wavy")}>/DASHBOARD</button>
                            <img src={user.picture} className="w-8 h-8 rounded-full border border-white/20" alt="profile"/>
                        </>
                    ) : (
                        <div className="opacity-90 hover:opacity-100 transition-opacity">
                            <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" size="medium" text="signin" />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-primary selection:text-black overflow-x-hidden relative">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: NOISE_SVG }}></div>
            <CustomCursor />
            <Toaster theme="dark" position="bottom-right" />
            <Navbar />

            <main className="relative z-10">
                {view === 'home' && (
                    <section className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
                        <div className="text-center max-w-5xl z-10">
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9]">SCALE AT <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">LIGHTSPEED</span></h1>
                            <div className="mt-12 w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row gap-2">
                                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://paste-your-link-here.com" className="flex-1 bg-transparent border-none outline-none text-white font-mono px-4 h-12"/>
                                <button onClick={handleShorten} disabled={loading} className="bg-white text-black font-bold font-mono px-8 py-3 rounded-xl hover:bg-primary transition-all">
                                    {loading ? <Loader2 className="animate-spin"/> : "DEPLOY"}
                                </button>
                            </div>
                            <AnimatePresence>
                                {createdLink && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-8 inline-block">
                                        <div className="border border-white/20 bg-black/50 p-6 rounded-xl backdrop-blur-md flex items-center gap-6">
                                            <span className="font-mono text-xl text-primary underline">{createdLink}</span>
                                            <button onClick={()=>{navigator.clipboard.writeText(createdLink); toast.success("Copied")}}><Copy size={20}/></button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {view === 'dashboard' && user && (
                    <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto min-h-screen">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userLinks.map((link) => (
                                <div key={link._id} className="group relative border border-white/10 bg-black p-6 rounded-xl hover:border-white/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-2xl font-mono font-bold">/{link.shortCode}</div>
                                        <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{link.clicks} HITS</span><button onClick={() => fetchAnalytics(link.shortCode)} className="bg-white text-black px-3 py-1 rounded text-xs font-bold hover:bg-primary">ANALYZE</button></div>
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">{link.originalUrl}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {selectedLinkStats && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
                            <div className="bg-[#09090b] border border-white/10 w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
                                    <div className="font-mono text-sm text-gray-400">LIVE_ANALYTICS_FEED</div>
                                    <button onClick={()=>setSelectedLinkStats(null)}><X/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">TOTAL CLICKS</div><div className="text-5xl font-black text-white">{selectedLinkStats.totalClicks}</div></div>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">TOP LOCATION</div><div className="text-2xl font-bold text-primary truncate">{selectedLinkStats.countries[0]?.name || 'Unknown'}</div></div>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">DEVICE</div><div className="text-2xl font-bold text-white truncate">{selectedLinkStats.os[0]?.name || 'Unknown'}</div></div>
                                    </div>
                                    <div className="h-[400px] w-full bg-white/5 border border-white/10 rounded-2xl p-4">
                                        {selectedLinkStats.timeline.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={selectedLinkStats.timeline}>
                                                    <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.5}/><stop offset="100%" stopColor="#fff" stopOpacity={0}/></linearGradient></defs>
                                                    <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}}/>
                                                    <Area type="monotone" dataKey="value" stroke="#fff" fill="url(#grad)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 font-mono">NO DATA AVAILABLE</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}