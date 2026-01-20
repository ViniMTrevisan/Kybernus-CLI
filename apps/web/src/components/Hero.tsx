"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal as TerminalIcon, Sparkles, ArrowRight, Command } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const terminalLines = [
    { text: "$ npm install -g kybernus", type: "command" },
    { text: "$ kybernus init", type: "command" },
    { text: "? Project Name: my-awesome-api", type: "input" },
    { text: "? Choose Stack: NestJS", type: "input" },
    { text: "? Architecture: Clean Architecture", type: "input" },
    { text: "> Fetching templates...", type: "info" },
    { text: "> Generating project structure...", type: "info" },
    { text: "✨ Successfully created my-awesome-api!", type: "success" },
    { text: "🚀 Ready to launch in 12.4s", type: "success" },
];

export function Hero() {
    const [currentLine, setCurrentLine] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLine((prev) => (prev < terminalLines.length ? prev + 1 : 0));
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
            {/* Premium Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.1),transparent_50%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                {/* Animated Mesh Gradients */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-cyber-blue/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        x: [0, -100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-cyber-purple/20 blur-[120px] rounded-full"
                />
            </div>

            {/* Particle Effect (CSS Only) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute h-1 w-1 bg-white rounded-full top-[10%] left-[20%] animate-pulse shadow-[0_0_10px_white]" />
                <div className="absolute h-1.5 w-1.5 bg-cyber-blue rounded-full top-[40%] left-[80%] animate-float shadow-[0_0_15px_#00f0ff]" />
                <div className="absolute h-1 w-1 bg-cyber-purple rounded-full top-[70%] left-[15%] animate-pulse shadow-[0_0_10px_#b026ff]" />
            </div>

            <div className="container relative z-10 px-4">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    <motion.div style={{ y, opacity }} className="flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 mb-8"
                        >
                            <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
                            <span className="text-xs font-bold tracking-widest uppercase text-cyber-blue">Available Now: v1.0.0</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-6xl md:text-9xl font-black mb-8 leading-[0.8] tracking-tight uppercase"
                        >
                            CODE <span className="text-cyber-blue text-glow">LESS</span>
                            <br />
                            BUILD <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-blue to-cyber-purple">MORE</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
                        >
                            The ultimate CLI orchestrator for scaffolding production-ready backend architectures. MVC, Clean, or Hexagonal—in seconds.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap justify-center gap-6 mb-20"
                        >
                            <a
                                href="/register"
                                className="relative group px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] inline-flex"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Premium Terminal Area */}
                    <div className="w-full max-w-4xl perspective-2000 mt-12">
                        <motion.div
                            initial={{ opacity: 0, y: 50, rotateX: 20 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="relative group"
                        >
                            {/* Outer Glow */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-3xl blur-[40px] opacity-10 group-hover:opacity-30 transition duration-1000" />

                            <div className="relative glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/80">
                                {/* Header */}
                                <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-6 justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                                        <TerminalIcon className="w-4 h-4" /> bash — 120x40
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-10 font-mono text-base min-h-[460px] text-left">
                                    <div className="space-y-4">
                                        {terminalLines.slice(0, currentLine).map((line, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "flex gap-4",
                                                    line.type === "command" && "text-white",
                                                    line.type === "input" && "text-cyber-blue",
                                                    line.type === "info" && "text-muted-foreground",
                                                    line.type === "success" && "text-neon-green"
                                                )}
                                            >
                                                <span className="shrink-0 select-none opacity-50 font-bold">
                                                    {line.type === "command" ? ">" : line.type === "input" ? "?" : " "}
                                                </span>
                                                <span className="font-bold">{line.text}</span>
                                            </motion.div>
                                        ))}
                                        {currentLine < terminalLines.length && (
                                            <div className="flex gap-2">
                                                <span className="text-white animate-pulse font-bold">_</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visual Decoration */}
                                    <div className="absolute bottom-6 right-8 text-white/5 pointer-events-none uppercase font-black text-8xl select-none italic">
                                        KYBERNUS
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
