"use client";

import { motion } from "framer-motion";
import { Server, Globe, Database, Cpu, Cloud, Laptop } from "lucide-react";

const stacks = [
    {
        name: "NestJS",
        description: "Enterprise-grade Node.js framework for scalable server-side apps.",
        icon: Server,
        color: "text-cyber-blue",
        bg: "bg-cyber-blue/10",
        tier: "Pro",
    },
    {
        name: "Next.js",
        description: "The React framework for production with SSR and static generation.",
        icon: Globe,
        color: "text-white",
        bg: "bg-white/10",
        tier: "Free",
    },
    {
        name: "Spring Boot",
        description: "The world's most popular Java framework for microservices.",
        icon: Database,
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        tier: "Free",
    },
    {
        name: "FastAPI",
        description: "Modern, high-performance Python framework for building APIs.",
        icon: Cpu,
        color: "text-cyber-purple",
        bg: "bg-cyber-purple/10",
        tier: "Pro",
    },
    {
        name: "Express.js",
        description: "Minimalist and flexible Node.js web application framework.",
        icon: Laptop,
        color: "text-cyber-pink",
        bg: "bg-cyber-pink/10",
        tier: "Free",
    },
    {
        name: "Terraform",
        description: "Infrastructure as Code for provisioning and managing clouds.",
        icon: Cloud,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        tier: "Pro",
    },
];

export function StackShowcase() {
    return (
        <section id="stacks" className="py-24 relative overflow-hidden bg-white/[0.02]">
            <div className="container px-4">
                <div className="text-center mb-20 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 mb-4"
                    >
                        <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase text-cyber-blue">Tech Ecosystem</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">
                        SUPPORTED <span className="text-cyber-blue">STACKS</span>
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed italic">
                        Kybernus configures the best tools for your mission.
                        <span className="block mt-2 text-sm not-italic font-bold text-cyber-purple">
                            Note: Advanced architectures (Clean/Hexagonal) require a PRO license for all stacks.
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto justify-items-center">
                    {stacks.map((stack, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="group relative glass-dark p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${stack.bg} group-hover:scale-110 transition-transform`}>
                                    <stack.icon className={`w-8 h-8 ${stack.color}`} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${stack.tier === 'Pro'
                                    ? 'border-cyber-blue/50 text-cyber-blue bg-cyber-blue/5'
                                    : 'border-white/10 text-white/50 bg-white/5'
                                    }`}>
                                    {stack.tier}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-3 text-white">{stack.name}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                {stack.description}
                            </p>

                            <div className="flex gap-2">
                                <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className={`h-full ${stack.tier === 'Pro' ? 'bg-cyber-blue' : 'bg-white/40'}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
