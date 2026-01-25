"use client";

import { motion } from "framer-motion";
import { Container, LockOpen, Network } from "lucide-react";

const features = [
    {
        icon: Container,
        title: "Stop Wasting 3 Days on Setup",
        description: "Last time you started a project, how long did you spend on Docker configs, CI/CD, and folder structure? 2 days? 3? Get it done in 2 minutes. That's $2,400 saved per project at $100/hr.",
        accent: "tech-blue",
    },
    {
        icon: LockOpen,
        title: "No Vendor Lock-In = No Regrets",
        description: "Your code. Your repo. Zero runtime dependencies. No proprietary garbage. If Kybernus disappeared tomorrow, your projects still work. Try that with SaaS scaffolders charging $49/month forever.",
        accent: "tech-purple",
    },
    {
        icon: Network,
        title: "Ship Features, Not Boilerplate",
        description: "Clean Architecture isn't just 'nice to have' — it's the difference between a 2-week refactor and a 2-month rewrite. Start right. Scale effortlessly. Your future self will thank you.",
        accent: "tech-success",
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
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 uppercase text-white">
                        Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">Kybernus?</span>
                    </h2>
                    <p className="text-lg font-mono text-muted-foreground max-w-2xl mx-auto">
                        // Built by engineers, for engineers. No fluff, just results.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group relative p-8 bg-tech-gray/30 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300"
                            >
                                {/* Hover gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.accent}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 mb-6 rounded-lg bg-${feature.accent}/10 border border-${feature.accent}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-7 h-7 text-${feature.accent}`} />
                                    </div>

                                    <h3 className="text-xl font-space font-bold mb-3 text-white uppercase tracking-wide">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Bottom accent line */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${feature.accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
