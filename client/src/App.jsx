// FORCE UPDATE V6 - FINAL PRODUCTION FIX (NO BLEEDING)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useTransform } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import emailjs from '@emailjs/browser';
import {
    Activity, Zap, Command, Lock, Clock, BarChart3, Globe,
    X, ShieldCheck, Copy, Terminal, ChevronRight, ChevronLeft, Fingerprint, MapPin,
    Loader2, Menu, ArrowRight, MousePointer2
} from 'lucide-react';
import {
    AreaChart, Area, PieChart as RePieChart,
    Pie, Cell, ResponsiveContainer, Tooltip, XAxis, Legend
} from 'recharts';

// --- UTILS & DESIGN SYSTEM ---
function cn(...inputs) { return twMerge(clsx(inputs)); }
const NOISE_SVG = "url('https://grainy-gradients.vercel.app/noise.svg')";

// --- UI COMPONENTS ---

const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    useEffect(() => {
        const moveCursor = (e) => { cursorX.set(e.clientX - 16); cursorY.set(e.clientY - 16); };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);
    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 bg-primary rounded-full mix-blend-difference pointer-events-none z-[9999] hidden md:block"
            style={{ x: cursorX, y: cursorY }}
        />
    );
};

const Marquee = ({ text }) => (
    <div className="relative flex overflow-x-hidden bg-primary text-black py-3 font-mono font-bold text-lg border-y border-black">
        <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
            {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-8 flex items-center gap-4">
                    {text} <Zap size={14} className="fill-black"/>
                </span>
            ))}
        </motion.div>
    </div>
);

// --- CODER DOODLE CARD ---
const CoderDoodleCard = () => {
    const contributions = Array.from({ length: 52 }).map((_, i) => Math.floor(Math.random() * 4));
    const contribColors = ['bg-[#161b22]', 'bg-[#0e4429]', 'bg-[#006d32]', 'bg-[#26a641]', 'bg-[#39d353]'];

    return (
        <motion.div
            whileHover={{ rotate: 0, scale: 1.02 }}
            initial={{ rotate: 2 }}
            className="relative w-[350px] md:w-[400px] h-auto bg-[#0d1117] border-[3px] border-white/80 rounded-xl p-6 text-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden font-mono group"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60 mix-blend-overlay z-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M 40 40 Q 10 80 50 100" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" className="sketch-line"/>
                <path d="M 45 95 L 50 100 L 55 95" stroke="white" strokeWidth="2" fill="none" className="sketch-line"/>
                <path d="M 100 85 Q 150 95 250 80" stroke="#6366f1" strokeWidth="2" fill="none" className="sketch-line-delay"/>
                <ellipse cx="320" cy="85" rx="40" ry="15" stroke="#facc15" strokeWidth="2" fill="none" strokeDasharray="8,4" transform="rotate(-10 320 85)" className="sketch-line"/>
            </svg>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-white/80 rounded-full overflow-hidden bg-black relative z-10 rotate-[-3deg] group-hover:rotate-0 transition-all shadow-xl">
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Kartik&backgroundColor=b6e3f4" alt="Dev" className="w-full h-full object-cover grayscale contrast-125" />
                        </div>
                        <span className="absolute -top-4 -left-4 text-xs text-gray-400 -rotate-12 font-handwriting">"The Architect" &rarr;</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-1 relative inline-block">KARTIK.B</h2>
                        <div className="flex flex-col items-start gap-1">
                            <div className="text-xs font-mono text-gray-400">@kartik_builds</div>
                            <div className="text-[10px] bg-primary text-black font-bold px-2 py-0.5 -rotate-2 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">FULL_STACK_DEV</div>
                        </div>
                    </div>
                </div>
                <div className="mb-8">
                    <h3 className="text-xs text-gray-400 mb-3 flex items-center gap-2 font-handwriting"><Terminal size={14}/> Weapons of Choice</h3>
                    <div className="flex flex-wrap gap-2">
                        {[ { name: "REACT", bg: "bg-[#61DAFB]", text: "text-black", rot: "-rotate-2" }, { name: "NODE", bg: "bg-[#339933]", text: "text-white", rot: "rotate-3" }, { name: "AWS", bg: "bg-[#FF9900]", text: "text-black", rot: "-rotate-1" }, { name: "NEXT.JS", bg: "bg-white", text: "text-black", rot: "rotate-2" }, { name: "MONGO", bg: "bg-[#47A248]", text: "text-white", rot: "-rotate-3" } ].map((tech, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }} className={cn("px-3 py-1 font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] cursor-default select-none", tech.bg, tech.text, tech.rot)}>{tech.name}</motion.div>
                        ))}
                    </div>
                </div>
                <div className="mb-8 p-3 bg-black/50 border border-white/10 rounded-lg relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 left-0 bg-white/10 px-2 py-0.5 text-[8px] font-mono border-b border-r border-white/10 text-gray-400">CONTRIBUTIONS_2026</div>
                    <div className="flex gap-1 mt-3 flex-wrap justify-center opacity-80">
                        {contributions.map((level, i) => ( <div key={i} className={cn("w-2.5 h-2.5 rounded-[1px]", contribColors[level])} /> ))}
                    </div>
                    <div className="text-right text-[10px] text-gray-500 mt-2 font-handwriting italic">It ain't much, but it's honest work &rarr;</div>
                </div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t-2 border-dashed border-white/10">
                    <div className="text-xs text-gray-400 flex items-center gap-2 group/status cursor-pointer"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"/><span className="group-hover/status:text-white transition-colors">Available for Hire</span></div>
                    <div className="flex gap-3"><button className="p-2 bg-white/5 hover:bg-white hover:text-black rounded-lg transition-all border border-white/10 hover:scale-110"><Globe size={16}/></button><button className="p-2 bg-white/5 hover:bg-white hover:text-black rounded-lg transition-all border border-white/10 hover:scale-110"><Zap size={16}/></button><button className="p-2 bg-white/5 hover:bg-white hover:text-black rounded-lg transition-all border border-white/10 hover:scale-110"><Command size={16}/></button></div>
                </div>
            </div>
            <style>{`.font-handwriting { font-family: 'Comic Sans MS', 'Comic Sans', cursive; } .sketch-line { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 1.5s forwards ease-out 0.5s; } .sketch-line-delay { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 1.5s forwards ease-out 1s; } @keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
        </motion.div>
    );
};

const ProUnlockSection = ({ onSuccess }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    return (
        <section className="relative py-32 overflow-hidden flex justify-center items-center bg-[#050505]">
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
                <div className="text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/5 to-transparent leading-none tracking-tighter scale-150 opacity-50 blur-sm font-sans">UNLEASH</div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>
            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono tracking-widest uppercase"><Lock size={12} /> Restricted Intel</div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">SEE THE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-gradient">UNSEEN.</span></h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">Unlock <span className="text-white font-bold">God-Mode Analytics</span>. Deep-dive into geo-heatmaps, device fingerprinting, and real-time traffic surges.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                        <div className="p-[1px] rounded-full bg-gradient-to-r from-primary via-white to-primary relative group">
                            <div className="absolute inset-0 bg-primary blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                            {/* Updated Google Login to be more responsive */}
                            <div className="relative bg-black rounded-full p-1">
                                <GoogleLogin
                                    onSuccess={onSuccess}
                                    theme="filled_black"
                                    shape="pill"
                                    size="large"
                                    text="continue_with"
                                    width="250"
                                />
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">// NO CREDIT CARD REQUIRED</span>
                    </div>
                </div>
                <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative w-full aspect-[4/3] perspective-1000">
                    <div className="absolute inset-0 bg-neutral-900/40 border border-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-white/5"><div className="w-3 h-3 rounded-full bg-red-500/50"></div><div className="w-3 h-3 rounded-full bg-yellow-500/50"></div><div className="w-3 h-3 rounded-full bg-green-500/50"></div><div className="ml-auto w-24 h-2 rounded-full bg-white/10"></div></div>
                        <div className="p-8 grid grid-cols-2 gap-4 opacity-50 blur-[2px] transition-all duration-500 hover:blur-none hover:opacity-80">
                            <div className="col-span-2 h-32 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-white/5 relative overflow-hidden">
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none"><defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs><motion.path d="M0,64 C100,50 200,80 300,40 C400,0 500,60 600,64 L600,128 L0,128 Z" fill="url(#grad)" stroke="none" animate={{ d: ["M0,64 C100,50 200,80 300,40 C400,0 500,60 600,64 L600,128 L0,128 Z", "M0,64 C100,80 200,40 300,70 C400,20 500,80 600,64 L600,128 L0,128 Z"] }} transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}/></svg>
                            </div>
                            <div className="h-24 rounded-xl bg-white/5 border border-white/5 p-4"><div className="w-8 h-8 rounded-full bg-primary/20 mb-2"></div><div className="w-16 h-4 bg-white/20 rounded mb-1"></div><div className="w-8 h-2 bg-white/10 rounded"></div></div>
                            <div className="h-24 rounded-xl bg-white/5 border border-white/5 p-4"><div className="w-8 h-8 rounded-full bg-purple-500/20 mb-2"></div><div className="w-16 h-4 bg-white/20 rounded mb-1"></div><div className="w-8 h-2 bg-white/10 rounded"></div></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-20"><div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl transform translate-z-20"><div className="p-3 bg-white/10 rounded-full border border-white/10"><Lock size={24} className="text-white" /></div><div className="text-center"><div className="text-white font-bold text-lg">Analysis Locked</div><div className="text-gray-400 text-xs font-mono mt-1">AUTHENTICATION_REQUIRED</div></div><button className="text-xs bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-colors">ACCESS_KEY</button></div></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const Navbar = ({ user, setView, view, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
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
                            <GoogleLogin onSuccess={onSuccess} theme="filled_black" shape="pill" size="medium" text="signin" />
                        </div>
                    )}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-16 left-0 right-0 bg-black border-b border-white/20 p-6 flex flex-col gap-4 font-mono md:hidden shadow-2xl z-50">
                        {user ? (
                            <>
                                <button onClick={() => { setView('home'); setIsOpen(false)}} className="text-left py-2 border-b border-white/10">CREATE LINK</button>
                                <button onClick={() => { setView('dashboard'); setIsOpen(false)}} className="text-left py-2 border-b border-white/10">DASHBOARD</button>
                            </>
                        ) : (
                            // FIXED MOBILE SIGN IN LAYOUT
                            <div className="pt-2 flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={onSuccess}
                                    theme="filled_black"
                                    shape="pill"
                                    size="large"
                                    text="signin"
                                    width="250"
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const FeatureCarousel = () => {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const features = [
        { title: "Real-Time Sockets", desc: "Live traffic flow analysis via WebSockets.", icon: <Activity className="w-full h-full text-black"/>, id: "01", color: "from-blue-500/20 to-purple-500/20" },
        { title: "Geo-Spatial Mapping", desc: "Pinpoint users to the city level precision.", icon: <Globe className="w-full h-full text-black"/>, id: "02", color: "from-emerald-500/20 to-teal-500/20" },
        { title: "Device Fingerprint", desc: "Deep OS, Browser & Hardware identification.", icon: <Fingerprint className="w-full h-full text-black"/>, id: "03", color: "from-orange-500/20 to-red-500/20" },
        { title: "Iron-Clad Security", desc: "Bcrypt hashing & JWT encrypted sessions.", icon: <Lock className="w-full h-full text-black"/>, id: "04", color: "from-pink-500/20 to-rose-500/20" },
    ];

    const next = () => { setDirection(1); setIndex((prev) => (prev + 1) % features.length); };
    const prev = () => { setDirection(-1); setIndex((prev) => (prev - 1 + features.length) % features.length); };

    const cardVariants = {
        enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0, rotateY: direction > 0 ? 15 : -15 }),
        center: { zIndex: 1, x: 0, opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 100 : -100, opacity: 0, rotateY: direction < 0 ? 15 : -15, transition: { duration: 0.4 } }),
    };

    const textVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: (custom) => ({ y: 0, opacity: 1, transition: { delay: custom * 0.1, duration: 0.5 } })
    };

    return (
        <section className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden font-sans selection:bg-white/20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
                    className={cn("absolute inset-0 bg-gradient-to-br opacity-10 blur-[150px]", features[index].color)}
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            <div className="flex-1 container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                <div className="lg:col-span-5 flex flex-col justify-between py-12 lg:py-24 relative">
                    <div className="flex flex-col items-start z-20">
                        <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"/>
                            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">System Capabilities</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mix-blend-overlay opacity-90 leading-[0.9]">CORE<br/>FEATURES.</h2>
                    </div>
                    <div className="relative h-[200px] md:h-[300px] flex items-end justify-start overflow-hidden mt-12 lg:mt-0">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={index}
                                initial={{ y: 100, opacity: 0, filter: "blur(20px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -100, opacity: 0, filter: "blur(20px)" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[35vw] lg:text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/0 leading-none select-none tracking-tighter font-mono translate-y-8"
                            >
                                {features[index].id}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-7 flex items-center justify-center lg:justify-end py-12 lg:py-0 relative">
                    <div className="absolute left-4 lg:-left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30 hidden lg:flex">
                        <button onClick={prev} className="p-4 rounded-full border border-white/10 bg-black/20 hover:bg-white hover:text-black transition-all group backdrop-blur-md"><ChevronLeft className="group-hover:-translate-y-1 transition-transform rotate-90"/></button>
                        <button onClick={next} className="p-4 rounded-full border border-white/10 bg-black/20 hover:bg-white hover:text-black transition-all group backdrop-blur-md"><ChevronRight className="group-hover:translate-y-1 transition-transform rotate-90"/></button>
                    </div>
                    <div className="w-full max-w-[550px] aspect-[4/5] md:aspect-square relative perspective-1000">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={index} custom={direction} variants={cardVariants} initial="enter" animate="center" exit="exit"
                                className="absolute inset-0 bg-[#0a0a0a] border border-white/10 p-8 md:p-14 flex flex-col justify-between rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex-1">
                                        <motion.div variants={textVariants} custom={0} initial="hidden" animate="visible" className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl flex items-center justify-center p-4 md:p-5 mb-8 md:mb-10 shadow-[0_0_40px_rgba(255,255,255,0.2)]">{features[index].icon}</motion.div>
                                        <div className="overflow-hidden"><motion.h3 variants={textVariants} custom={1} initial="hidden" animate="visible" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tighter leading-[0.9]">{features[index].title}</motion.h3></div>
                                        <div className="overflow-hidden"><motion.p variants={textVariants} custom={2} initial="hidden" animate="visible" className="text-gray-400 font-mono text-base md:text-lg leading-relaxed border-l-2 border-white/20 pl-6">{features[index].desc}</motion.p></div>
                                    </div>
                                    <div className="w-full h-[2px] bg-white/10 mt-auto relative overflow-hidden rounded-full"><motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }} className="absolute inset-0 bg-white h-full" /></div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="flex lg:hidden gap-4 absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <button onClick={prev} className="p-3 rounded-full border border-white/10 bg-black/20 text-white"><ChevronLeft/></button>
                        <button onClick={next} className="p-3 rounded-full border border-white/10 bg-black/20 text-white"><ChevronRight/></button>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
                {features.map((_, i) => (
                    <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }} className="group relative py-2">
                        <div className={cn("h-[2px] transition-all duration-500 rounded-full", i === index ? "w-12 bg-white" : "w-3 bg-white/20 group-hover:bg-white/50")} />
                    </button>
                ))}
            </div>
        </section>
    );
};

const AuthorSection = () => {
    const form = useRef();
    const [status, setStatus] = useState('idle');

    // --- REAL EMAIL LOGIC RESTORED (WITH YOUR KEYS) ---
    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        // 👇 YOUR REAL KEYS FROM YOUR SCREENSHOT
        emailjs.sendForm('service_lfynwcc', 'template_50rsga7', form.current, 'pkKB-iN6UyzoAGoTe')
            .then((result) => {
                setStatus('success');
                toast.success("Transmission Received", { description: "I will respond shortly." });
                setTimeout(() => setStatus('idle'), 3000);
            }, (error) => {
                console.error("Email Error:", error);
                setStatus('error');
                toast.error("Transmission Failed", { description: "Check console for details." });
                setTimeout(() => setStatus('idle'), 3000);
            });
    };

    return (
        <section className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center border-t border-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="container mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

                {/* Left Side: Form */}
                <div className="order-2 lg:order-1">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <div className={cn("w-2 h-2 rounded-full", status === 'sending' ? "bg-yellow-500 animate-ping" : status === 'success' ? "bg-green-500" : "bg-red-500")}></div>
                            <span className="font-mono text-xs text-gray-500 tracking-widest uppercase">{status === 'idle' ? 'Uplink Offline' : status === 'sending' ? 'Establishing Connection...' : status === 'success' ? 'Transmission Secure' : 'Connection Failed'}</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">INITIATE<br/>CONTACT.</h2>
                        <p className="text-gray-400 text-lg max-w-md leading-relaxed">Ready to deploy? Send a signal directly to my terminal.</p>
                    </div>

                    {/* ✅ CONNECTED TO sendEmail FUNCTION */}
                    <form ref={form} onSubmit={sendEmail} className="space-y-8">
                        <div className="group relative">
                            <label className="text-xs font-mono text-gray-500 mb-2 block group-focus-within:text-primary transition-colors">OPERATOR_ID</label>
                            <input type="text" name="user_name" placeholder="Enter Name" required className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/10"/>
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-500"></div>
                        </div>
                        <div className="group relative">
                            <label className="text-xs font-mono text-gray-500 mb-2 block group-focus-within:text-primary transition-colors">COMM_FREQUENCY</label>
                            <input type="email" name="user_email" placeholder="name@domain.com" required className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/10"/>
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-500"></div>
                        </div>
                        <div className="group relative">
                            <label className="text-xs font-mono text-gray-500 mb-2 block group-focus-within:text-primary transition-colors">PAYLOAD_DATA</label>
                            <textarea name="message" placeholder="Describe your mission parameters..." required rows={3} className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-bold text-white outline-none focus:border-primary transition-all placeholder:text-white/10 resize-none"/>
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-500"></div>
                        </div>
                        <button type="submit" disabled={status === 'sending' || status === 'success'} className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-bold font-mono text-sm uppercase tracking-wider hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                            <span className="relative z-10 flex items-center gap-2">{status === 'idle' && <>SEND TRANSMISSION <ArrowRight size={16}/></>}{status === 'sending' && <>ENCRYPTING... <Loader2 size={16} className="animate-spin"/></>}{status === 'success' && <>SENT <ShieldCheck size={16}/></>}{status === 'error' && <>FAILED <X size={16}/></>}</span>
                            {status === 'idle' && <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>}
                        </button>
                    </form>
                </div>

                {/* Right Side: Doodle */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-center relative">
                    <div className="relative z-10">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full border-dashed z-0 pointer-events-none"/>
                        <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full z-0 pointer-events-none"/>
                        <motion.div whileHover={{ scale: 1.02, rotate: 0 }} initial={{ rotate: 3 }} className="relative z-10 py-10">
                            <CoderDoodleCard />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SpotlightCard = ({ children, className = "" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }
    return (
        <div className={cn("group relative border border-white/10 bg-black overflow-hidden hover:border-white/30 transition-all duration-500", className)} onMouseMove={handleMouseMove}>
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.1), transparent 40%)` }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
};

// --- MAIN APP ---

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

    // --- DYNAMIC API CONFIGURATION ---
    const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // ⚠️ REPLACE THIS WITH YOUR REAL RENDER/VERCEL BACKEND URL
    const PROD_API = "https://pulse-backend-api.onrender.com";
    const API_BASE = IS_LOCALHOST ? "http://localhost:5000" : PROD_API;

    const handleGoogleSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        setUser(decoded);
        toast.success(`Access Granted`, { description: `Welcome, ${decoded.given_name}` });
        fetchUserLinks(decoded.sub);
    };

    const fetchUserLinks = async (userId) => {
        try {
            const res = await axios.get(`${API_BASE}/api/stats/${userId}`);
            setUserLinks(res.data);
        } catch (e) { console.error(e) }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gateRequest = params.get('gate');
        if (gateRequest) { setGateCode(gateRequest); setView('password-gate'); window.history.replaceState({}, document.title, window.location.pathname); }
    }, []);

    // --- 🛡️ CRASH-PROOF ANALYTICS FETCH ---
    const fetchAnalytics = async (shortCode) => {
        try {
            const res = await axios.get(`${API_BASE}/api/analytics/${shortCode}`);
            const data = res.data || {}; // Safety Net 1: Ensure data object exists

            // Safety Net 2: Helper to convert Objects to Arrays without crashing
            const transform = (obj) => {
                if (!obj || Object.keys(obj).length === 0) return [];
                return Object.entries(obj).map(([name, value]) => ({ name, value }));
            };

            // Safety Net 3: Sort timeline only if data exists
            const rawTimeline = transform(data.timeline);
            const sortedTimeline = rawTimeline.sort((a, b) => new Date(a.name) - new Date(b.name));

            setSelectedLinkStats({
                totalClicks: data.totalClicks || 0,
                countries: transform(data.countries),
                os: transform(data.os),
                browsers: transform(data.browsers),
                timeline: sortedTimeline
            });
        } catch (err) {
            console.error("Analytics Error:", err);
            // Don't crash the app, just show a toast
            toast.error("Analytics Unavailable", { description: "No data found for this link yet." });
        }
    };

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

    const verifyGate = async () => {
        try {
            const res = await axios.get(`${API_BASE}/${gateCode}`, { params: { password: gatePass }, headers: { 'Accept': 'application/json' } });
            window.location.href = res.data.url;
            setView('home'); setGatePass('');
        } catch (err) { toast.error("Access Denied"); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-primary selection:text-black overflow-x-hidden relative">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: NOISE_SVG }}></div>
            <CustomCursor />
            <Toaster theme="dark" position="bottom-right" />
            <Navbar user={user} setView={setView} view={view} onSuccess={handleGoogleSuccess} />

            <main className="relative z-10">
                {view === 'home' && (
                    <>
                        <section className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
                            <motion.div initial={{opacity:0, y: 50}} animate={{opacity:1, y:0}} transition={{duration: 0.8, ease:"circOut"}} className="text-center max-w-5xl z-10">
                                <div className="flex items-center justify-center gap-2 mb-6 opacity-70">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"/>
                                    <span className="font-mono text-xs tracking-[0.2em] uppercase">System Operational</span>
                                </div>
                                <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9]">SCALE AT <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">LIGHTSPEED</span></h1>
                                <div className="mt-12 w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row gap-2 transition-all focus-within:ring-2 ring-primary/50 focus-within:bg-black/80">
                                    <div className="flex-1 flex items-center px-4">
                                        <span className="text-primary font-mono mr-2">{'>'}</span>
                                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://paste-your-link-here.com" className="w-full bg-transparent border-none outline-none text-white font-mono placeholder:text-gray-600 h-12"/>
                                    </div>
                                    <button onClick={handleShorten} disabled={loading} className="bg-white text-black font-bold font-mono px-8 py-3 rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="animate-spin"/> : "DEPLOY"}
                                    </button>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                        <span className="text-gray-500 font-mono text-xs mr-2">ALIAS/</span>
                                        <input value={alias} onChange={e=>setAlias(e.target.value)} className="bg-transparent outline-none w-20 text-xs font-mono"/>
                                    </div>
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                        <Lock size={12} className="text-gray-500 mr-2"/>
                                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="PASS" className="bg-transparent outline-none w-16 text-xs font-mono"/>
                                    </div>
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                        <Clock size={12} className="text-gray-500 mr-2"/>
                                        <input type="datetime-local" value={expiry} onChange={e=>setExpiry(e.target.value)} className="bg-transparent outline-none w-24 text-xs text-gray-500"/>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {createdLink && (
                                        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="mt-8 inline-block">
                                            <div className="bg-primary text-black p-1 font-mono text-xs font-bold uppercase mb-[-1px] ml-4 w-fit relative z-10">Success</div>
                                            <div className="border border-white/20 bg-black/50 p-6 rounded-xl backdrop-blur-md flex items-center gap-6">
                                                <span className="font-mono text-xl text-primary underline">{createdLink}</span>
                                                <button onClick={()=>{navigator.clipboard.writeText(createdLink); toast.success("Copied")}}><Copy size={20}/></button>
                                            </div>
                                            {!user && ( <div className="mt-4"><GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="pill" size="medium" /></div> )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </section>
                        <Marquee text="ANALYTICS • SECURITY • SPEED • RELIABILITY •" />
                        {!user && ( <ProUnlockSection onSuccess={handleGoogleSuccess} /> )}
                        <FeatureCarousel />
                        <AuthorSection />
                        <footer className="h-[50vh] flex flex-col justify-end p-12 bg-neutral-950 border-t border-white/10">
                            <h2 className="text-[12vw] font-black leading-none text-neutral-800 select-none">PULSE.IO</h2>
                            <div className="flex justify-between items-end mt-8 text-neutral-500 font-mono text-sm">
                                <div>© 2026 KARTIK BHARGAVA ENGINEERING.</div>
                                <div className="flex gap-4"><a href="#" className="hover:text-white">GITHUB</a><a href="#" className="hover:text-white">LINKEDIN</a></div>
                            </div>
                        </footer>
                    </>
                )}
                {view === 'dashboard' && user && (
                    <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto min-h-screen">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                            <div><h1 className="text-5xl font-bold tracking-tighter">Command Center</h1><p className="text-gray-500 font-mono mt-2">USER: {user.name.toUpperCase()}</p></div>
                            <div className="text-right"><div className="text-4xl font-mono text-primary">{userLinks.length}</div><div className="text-xs text-gray-500">ACTIVE LINKS</div></div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userLinks.map((link, i) => (
                                <SpotlightCard key={link._id} className="h-64 p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><Activity size={18} /></div>
                                        <div className="flex gap-2">{link.password && <Lock size={14} className="text-amber-500"/>}<button onClick={() => { navigator.clipboard.writeText(`${API_BASE}/${link.shortCode}`); toast.success("Copied") }} className="hover:text-white text-gray-500 transition-colors"><Copy size={16}/></button></div>
                                    </div>
                                    <div><a href={link.originalUrl} target="_blank" className="text-2xl font-mono font-bold hover:text-primary transition-colors block mb-1">/{link.shortCode}</a><p className="text-xs text-gray-600 truncate font-mono">{link.originalUrl}</p></div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-baseline gap-1"><span className="text-xl font-bold">{link.clicks}</span><span className="text-[10px] text-gray-500">HITS</span></div>
                                        <button onClick={() => fetchAnalytics(link.shortCode)} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">ANALYZE</button>
                                    </div>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                )}
                <AnimatePresence>
                    {selectedLinkStats && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
                            <div className="bg-[#09090b] border border-white/10 w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
                                    <div className="flex items-center gap-4"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"/><span className="font-mono text-sm text-gray-400">LIVE_ANALYTICS_FEED</span></div>
                                    <button onClick={()=>setSelectedLinkStats(null)} className="hover:rotate-90 transition-transform duration-300"><X/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 bg-grid-pattern">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">TOTAL CLICKS</div><div className="text-5xl font-black text-white">{selectedLinkStats.totalClicks}</div></div>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">TOP LOCATION</div><div className="text-2xl font-bold text-primary truncate">{selectedLinkStats.countries[0]?.name || 'Unknown Location'}</div></div>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="text-gray-500 text-xs font-mono mb-2">DEVICE</div><div className="text-2xl font-bold text-white truncate">{selectedLinkStats.os[0]?.name || 'Unknown Device'}</div></div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                                        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl relative">
                                            <div className="absolute top-6 right-6 font-mono text-xs text-gray-500">TRAFFIC_OVER_TIME</div>
                                            <ResponsiveContainer width="100%" height="100%">
                                                {/* 👇 THE FIX: Only render chart if we actually have data points 👇 */}
                                                {selectedLinkStats.timeline && selectedLinkStats.timeline.length > 0 ? (
                                                    <AreaChart data={selectedLinkStats.timeline}>
                                                        <defs>
                                                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#fff" stopOpacity={0.2}/>
                                                                <stop offset="100%" stopColor="#fff" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <Tooltip
                                                            contentStyle={{background:'#09090b', border:'1px solid #333', borderRadius: '8px'}}
                                                            itemStyle={{color:'#fff', fontFamily: 'monospace'}}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#fff"
                                                            strokeWidth={2}
                                                            fill="url(#chartGrad)"
                                                            animationDuration={1500}
                                                        />
                                                    </AreaChart>
                                                ) : (
                                                    // 👇 Fallback UI when there is no data yet
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                                        <BarChart3 size={48} className="mb-2" />
                                                        <span className="font-mono text-xs tracking-widest">AWAITING_TRAFFIC_DATA</span>
                                                    </div>
                                                )}
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePieChart>
                                                    <Pie data={selectedLinkStats.os} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {selectedLinkStats.os.map((entry, index) => ( <Cell key={`cell-${index}`} fill={['#fff', '#666', '#333', '#999'][index % 4]} /> ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}}/>
                                                    <Legend verticalAlign="bottom"/>
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {view === 'password-gate' && (
                    <div className="min-h-screen flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-red-900/10 z-0 animate-pulse"></div>
                        <div className="text-center z-10 border border-red-500/20 bg-black p-12 rounded-2xl backdrop-blur-xl">
                            <Lock size={64} className="mx-auto text-red-500 mb-6"/>
                            <h1 className="text-4xl font-black mb-2 tracking-tighter">CLASSIFIED</h1>
                            <p className="font-mono text-red-400 mb-8">ENCRYPTED GATEWAY DETECTED</p>
                            <div className="flex border border-white/20 rounded-lg overflow-hidden">
                                <input type="password" value={gatePass} onChange={e=>setGatePass(e.target.value)} placeholder="ACCESS KEY" className="bg-transparent p-4 outline-none font-mono text-center w-64"/>
                                <button onClick={verifyGate} className="bg-white text-black px-6 hover:bg-red-500 hover:text-white transition-colors">ENTER</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}