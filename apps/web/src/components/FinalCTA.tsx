"use client";

import { motion } from "framer-motion";
import { Terminal, Copy, ArrowRight } from "lucide-react";
import { useState } from "react";

export function FinalCTA() {
    const [copied, setCopied] = useState(false);
    const command = "npm install -g kybernus";

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-24 relative overflow-hidden bg-tech-black">
            {/* Background Decor */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container px-4">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-tech-zinc/40 backdrop-blur-xl p-12 md:p-20 border border-white/10 relative overflow-hidden group"
                    >
                        {/* Tech Borders */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />

                        <h2 className="text-4xl md:text-7xl font-space font-bold mb-6 tracking-tighter uppercase leading-[0.9] text-white">
                            STOP WRITING <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple italic">BOILERPLATE</span>
                        </h2>
                        <p className="text-xl font-mono text-muted-foreground mb-12 max-w-xl mx-auto">
                            // Start your next production system in seconds. <br />
                            Kybernus is free to start, and built for a lifetime of engineering excellence.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="relative group w-full md:w-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-tech-blue to-tech-purple rounded blur opacity-25 group-hover:opacity-75 transition duration-500" />
                                <button
                                    onClick={handleCopy}
                                    className="relative w-full md:w-auto flex items-center gap-4 bg-black px-8 py-5 border border-white/10 font-mono text-sm group-hover:border-white/30 transition-all active:scale-95"
                                >
                                    <Terminal className="w-5 h-5 text-tech-blue" />
                                    <span className="text-white">{command}</span>
                                    <div className="ml-4 h-8 w-px bg-white/10" />
                                    <div className="flex items-center gap-2 min-w-[80px]">
                                        <Copy className={`w-4 h-4 transition-all ${copied ? "text-tech-success scale-110" : "text-muted-foreground hover:text-white"}`} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                            {copied ? "COPIED" : "COPY"}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            <a
                                href="/docs"
                                className="flex items-center gap-2 group text-white font-mono font-bold uppercase tracking-widest text-xs hover:text-tech-blue transition-colors px-6 py-3 border border-transparent hover:border-white/10"
                            >
                                View Documentation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
