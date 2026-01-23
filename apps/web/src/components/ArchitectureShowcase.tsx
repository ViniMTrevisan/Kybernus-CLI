"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function ArchitectureShowcase() {
    return (
        <section className="py-32 relative overflow-hidden bg-tech-black">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-purple/5 rounded-full blur-[150px]" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 uppercase text-white">
                        SEE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">STRUCTURE</span>
                    </h2>
                    <p className="text-lg font-mono text-muted-foreground max-w-2xl mx-auto">
                        // Architecture intended for <span className="text-tech-success">scalability</span>, not just boilerplate.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="relative group">
                        {/* Outer glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-tech-blue via-tech-purple to-tech-success rounded-lg blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />

                        {/* Card */}
                        <div className="relative bg-tech-gray/30 border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl">
                            {/* Header */}
                            <div className="bg-tech-gray/50 border-b border-white/10 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        FastAPI — Clean Architecture
                                    </span>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="p-3 bg-[#1e1e1e]">
                                <div className="relative rounded overflow-hidden border border-white/5">
                                    <Image
                                        src="/architecture-demo.png"
                                        alt="Clean Architecture folder structure - domain, infrastructure, use-cases"
                                        width={400}
                                        height={250}
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-tech-gray/50 border-t border-white/10 px-3 py-2">
                                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                                    <span>Domain → Infra → Use Cases</span>
                                    <span className="text-tech-success">✓ Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Caption */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mt-4 text-xs font-mono text-muted-foreground"
                    >
                        From <span className="text-tech-blue">entities</span> to <span className="text-tech-purple">infrastructure</span>,
                        every file has a purpose. <span className="text-tech-success">Zero bloat</span>.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
