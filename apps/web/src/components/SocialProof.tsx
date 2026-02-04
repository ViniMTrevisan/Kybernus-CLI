"use client";

import { motion } from "framer-motion";
import { Users, Github } from "lucide-react";

export function SocialProof() {
    return (
        <section id="community" className="py-32 relative overflow-hidden bg-tech-black">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tech-blue/10 rounded-full blur-[120px]" />

            <div className="container px-4 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6">
                        <Users className="w-3 h-3 text-tech-blue" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-blue">Community Driven</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tight mb-6 uppercase text-white">
                        JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">REVOLUTION</span>
                    </h2>

                    <p className="text-xl font-mono text-muted-foreground mb-12">
                        // Kybernus is built for developers, by developers. <br />
                        We are open source and rely on your support to grow.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
                        {/* Card 1: Contribute */}
                        <motion.a
                            href="https://github.com/ViniMTrevisan/Kybernus-CLI"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5 }}
                            className="p-8 bg-tech-gray/30 border border-white/5 hover:border-tech-blue/50 transition-all group text-left"
                        >
                            <Github className="w-8 h-8 text-white mb-4 group-hover:text-tech-blue transition-colors" />
                            <h3 className="text-lg font-bold text-white mb-2 font-space">Contribute Code</h3>
                            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                Help us improve the CLI. Fork the repo, squash bugs, or add new templates.
                            </p>
                        </motion.a>

                        {/* Card 2: Discord */}
                        <motion.a
                            href="https://discord.gg/M2GyVqX2hg"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5 }}
                            className="p-8 bg-tech-gray/30 border border-white/5 hover:border-tech-purple/50 transition-all group text-left"
                        >
                            <Users className="w-8 h-8 text-white mb-4 group-hover:text-tech-purple transition-colors" />
                            <h3 className="text-lg font-bold text-white mb-2 font-space">Join Community</h3>
                            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                Chat with us on Discord. Get help, share ideas, and meet other developers.
                            </p>
                        </motion.a>
                    </div>

                    <motion.a
                        href="https://github.com/vinitrevisan/kybernus"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold uppercase tracking-widest text-sm hover:bg-tech-blue transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        Star on GitHub
                    </motion.a>
                </motion.div>

            </div>
        </section>
    );
}
