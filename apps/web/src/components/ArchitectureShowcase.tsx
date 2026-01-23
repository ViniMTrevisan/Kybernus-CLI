"use client";

import { motion } from "framer-motion";
import { FolderTree, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ArchitectureShowcase() {
    return (
        <section className="py-24 relative overflow-hidden bg-tech-black">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-tech-gray/30 border border-white/10 rounded mb-8">
                        <FolderTree className="w-4 h-4 text-tech-purple" />
                        <span className="text-xs font-mono font-bold uppercase text-white">Architecture Explorer</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 uppercase text-white">
                        SEE <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">EVERY</span> STRUCTURE
                    </h2>

                    <p className="text-lg font-mono text-muted-foreground mb-10 max-w-2xl mx-auto">
                        // Don't just trust us. <span className="text-tech-success">Inspect every folder</span>, every file, every architecture pattern. <br />
                        All 5 stacks × 3 architectures = 15 production templates.
                    </p>

                    <Link href="/structure">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative px-12 py-6 bg-gradient-to-r from-tech-blue to-tech-purple text-white font-mono font-bold uppercase tracking-widest text-sm transition-all hover:shadow-2xl hover:shadow-tech-purple/50"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Explore All Architectures
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>
                    </Link>

                    <p className="text-xs font-mono text-muted-foreground mt-6">
                        MVC • Clean Architecture • Hexagonal Architecture
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
