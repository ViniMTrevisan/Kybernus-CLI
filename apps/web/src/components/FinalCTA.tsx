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
        <section className="py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-cyber-blue/5 opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent" />

            <div className="container px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-dark p-12 md:p-20 rounded-[48px] border border-white/10 relative overflow-hidden"
                    >
                        {/* Inner Glow */}
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cyber-blue/10 blur-[100px] rounded-full" />

                        <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                            STOP WRITING <br />
                            <span className="text-cyber-blue italic">BOILERPLATE</span>
                        </h2>
                        <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                            Start your next production system in seconds. Kybernus is free
                            to start, and built for a lifetime of engineering excellence.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <div className="relative group w-full md:w-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
                                <button
                                    onClick={handleCopy}
                                    className="relative w-full md:w-auto flex items-center gap-4 bg-black px-8 py-5 rounded-2xl border border-white/10 font-mono text-sm group-hover:border-white/20 transition-all active:scale-95"
                                >
                                    <Terminal className="w-5 h-5 text-cyber-blue" />
                                    <span className="text-white">{command}</span>
                                    <div className="ml-4 h-8 w-px bg-white/10" />
                                    <div className="flex items-center gap-2 min-w-[80px]">
                                        <Copy className={`w-4 h-4 transition-all ${copied ? "text-neon-green scale-110" : "text-muted-foreground hover:text-white"}`} />
                                        <span className="text-[10px] uppercase font-black tracking-widest">
                                            {copied ? "Copied!" : "Copy"}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            <a
                                href="/docs"
                                className="flex items-center gap-2 group text-white font-black uppercase tracking-widest text-xs hover:text-cyber-blue transition-colors"
                            >
                                View Documentation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>

                        <div className="mt-16 flex justify-center items-center gap-8">
                            <div className="text-xs font-black uppercase tracking-tighter text-muted-foreground">
                                PRO V1.0.0 RELEASED
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
