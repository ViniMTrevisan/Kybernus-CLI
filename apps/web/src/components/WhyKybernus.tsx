"use client";

import { motion } from "framer-motion";
import { Container, LockOpen, Network } from "lucide-react";

const features = [
    {
        icon: Container,
        title: "Stop Wasting 3 Days on Setup",
        description: "Last time you started a project, how long did you spend on Docker configs, CI/CD, and folder structure? 2 days? 3? Get it done in 2 minutes. That's $2,400 saved per project at $100/hr.",
        accent: "text-tech-blue",
        bg: "bg-tech-blue/10",
        border: "border-tech-blue/20"
    },
    {
        icon: LockOpen,
        title: "No Vendor Lock-In = No Regrets",
        description: "Your code. Your repo. Zero runtime dependencies. No proprietary garbage. If Kybernus disappeared tomorrow, your projects still work. Try that with SaaS scaffolders charging $49/month forever.",
        accent: "text-tech-purple",
        bg: "bg-tech-purple/10",
        border: "border-tech-purple/20"
    },
    {
        icon: Network,
        title: "Ship Features, Not Boilerplate",
        description: "Clean Architecture isn't just 'nice to have' — it's the difference between a 2-week refactor and a 2-month rewrite. Start right. Scale effortlessly. Your future self will thank you.",
        accent: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/20"
    },
];

export function WhyKybernus() {
    return (
        <section id="why-us" className="relative py-32 bg-tech-black overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Accent gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-tech-purple to-transparent" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-32"
                >
                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 uppercase text-white">
                        Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">Kybernus?</span>
                    </h2>
                    <p className="text-lg font-mono text-muted-foreground max-w-2xl mx-auto">
                        // Built by engineers, for engineers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => {
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover="hover"
                                className="group relative p-10 rounded-3xl cursor-pointer"
                            >
                                {/* The Hover Shield/Background */}
                                <motion.div
                                    variants={{
                                        hover: {
                                            opacity: 1,
                                            scale: 1,
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                            borderColor: "rgba(0, 240, 255, 0.5)",
                                            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.1)"
                                        }
                                    }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    className="absolute inset-0 border border-white/5 rounded-3xl -z-10 backdrop-blur-xl transition-all duration-300"
                                />

                                <div className="relative z-10 pointer-events-none">
                                    <motion.div
                                        variants={{
                                            hover: { y: -5, scale: 1.1, color: "#00f0ff" }
                                        }}
                                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-8 text-lg font-mono font-bold text-tech-blue/40 transition-colors duration-300"
                                    >
                                        0{index + 1}
                                    </motion.div>

                                    <motion.h3
                                        variants={{
                                            hover: { x: 10, scale: 1.05 }
                                        }}
                                        className="text-2xl font-space font-bold mb-4 text-white uppercase tracking-tight group-hover:text-tech-blue transition-all duration-300"
                                    >
                                        {feature.title}
                                    </motion.h3>

                                    <motion.p
                                        variants={{
                                            hover: { x: 10, opacity: 1 }
                                        }}
                                        className="text-sm font-mono text-muted-foreground leading-relaxed group-hover:text-white/90 transition-all duration-300"
                                    >
                                        {feature.description}
                                    </motion.p>
                                </div>

                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
