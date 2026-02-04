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
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 bg-tech-black">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-tech-black via-transparent to-tech-black" />

            {/* Accent Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tech-blue/10 rounded-full blur-[150px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tech-purple/10 rounded-full blur-[150px] animate-pulse-slow delay-1000" />

            <div className="container relative z-10 px-4">
                <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
                    <motion.div style={{ y, opacity }} className="flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded bg-tech-gray border border-white/10 mb-10 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-tech-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-1.5 h-1.5 rounded-sm bg-tech-success animate-pulse" />
                            <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">System Online</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl md:text-8xl font-space font-bold mb-8 leading-[0.9] tracking-tight uppercase text-white"
                        >
                            CODE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">LESS.</span>
                            <br />
                            BUILD <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">MORE.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg md:text-xl font-mono text-muted-foreground mb-12 max-w-3xl leading-relaxed"
                        >
                            // The ultimate CLI orchestrator for production-ready backend architectures. <br className="hidden md:block" />
                            <span className="text-tech-blue">MVC</span>, <span className="text-tech-purple">Clean</span>, or <span className="text-tech-success">Hexagonal</span> — generate instantly.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
                        >
                            <motion.a
                                href="/docs"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative px-10 py-5 bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-sm transition-all hover:bg-white hover:text-black overflow-hidden shadow-lg hover:shadow-tech-purple/50 min-w-[240px] text-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Quick Start <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </motion.a>

                            <motion.a
                                href="https://github.com/ViniMTrevisan/Kybernus-CLI"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative px-10 py-5 bg-transparent border-2 border-white/20 text-white font-mono font-bold uppercase tracking-widest text-sm transition-all hover:border-white hover:bg-white/5 min-w-[240px] text-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Star on GitHub
                                </span>
                            </motion.a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.45 }}
                            className="flex justify-center mb-16"
                        >
                            <a
                                href="https://discord.gg/M2GyVqX2hg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-tech-purple transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-tech-purple animate-pulse" />
                                Join the Community on Discord
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="mb-24"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded bg-tech-gray/50 border border-white/10 font-mono text-sm">
                                <TerminalIcon className="w-4 h-4 text-tech-blue" />
                                <code className="text-white">npm install -g kybernus</code>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Terminal Demo GIF */}
                    <div className="w-full max-w-4xl perspective-2000">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="relative group"
                        >
                            {/* Outer Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-tech-blue to-tech-purple rounded shadow-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />

                            <div className="relative bg-[#0d0d0d] rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                                {/* Mac-style Header */}
                                <div className="h-10 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground opacity-50">
                                        <Command className="w-3 h-3" /> kybernus-cli — node — 80x24
                                    </div>
                                </div>

                                {/* Live Terminal Code Animation */}
                                <div className="relative bg-black/80 backdrop-blur-xl p-6 font-mono text-xs md:text-sm min-h-[300px] overflow-hidden">
                                    <div className="space-y-2">
                                        {terminalLines.map((line, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{
                                                    opacity: index <= currentLine ? 1 : 0,
                                                    x: index <= currentLine ? 0 : -10
                                                }}
                                                className="flex items-start gap-3"
                                            >
                                                {line.type === 'command' && <span className="text-tech-purple font-bold shrink-0">$</span>}
                                                {line.type === 'input' && <span className="text-tech-blue font-bold shrink-0">?</span>}
                                                {line.type === 'success' && <span className="text-tech-success font-bold shrink-0">✔</span>}
                                                {line.type === 'info' && <span className="text-tech-blue font-bold shrink-0">i</span>}
                                                <span className={`${line.type === 'command' ? 'text-white' :
                                                    line.type === 'success' ? 'text-tech-success' :
                                                        line.type === 'info' ? 'text-muted-foreground' :
                                                            'text-white/90'
                                                    }`}>
                                                    {line.text}
                                                </span>
                                            </motion.div>
                                        ))}

                                        {/* Cursor */}
                                        <motion.div
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                            className="w-2.5 h-4 bg-tech-purple inline-block ml-1"
                                        />
                                    </div>
                                </div>

                                {/* Status Bar */}
                                <div className="h-8 bg-[#1a1a1a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] font-mono text-muted-foreground">
                                    <div className="flex gap-4">
                                        <span>Running Task: scaffold</span>
                                        <span>CPU: 12%</span>
                                    </div>
                                    <span>TypeScript</span>
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
