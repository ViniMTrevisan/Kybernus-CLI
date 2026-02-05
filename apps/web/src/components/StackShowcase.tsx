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
    },
    {
        name: "Next.js",
        description: "The React framework for production with SSR and static generation.",
        icon: Globe,
        color: "text-white",
        bg: "bg-white/10",
    },
    {
        name: "Spring Boot",
        description: "The world's most popular Java framework for microservices.",
        icon: Database,
        color: "text-neon-green",
        bg: "bg-neon-green/10",
    },
    {
        name: "FastAPI",
        description: "Modern, high-performance Python framework for building APIs.",
        icon: Cpu,
        color: "text-cyber-purple",
        bg: "bg-cyber-purple/10",
    },
    {
        name: "Express.js",
        description: "Minimalist and flexible Node.js web application framework.",
        icon: Laptop,
        color: "text-cyber-pink",
        bg: "bg-cyber-pink/10",
    },
    {
        name: "Terraform",
        description: "Infrastructure as Code for provisioning and managing clouds.",
        icon: Cloud,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
];

export function StackShowcase() {
    return (
        <section id="stacks" className="py-32 relative overflow-hidden bg-tech-black">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="container relative z-10 px-4">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6"
                    >
                        <Cpu className="w-3 h-3 text-tech-blue" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-blue">Tech Ecosystem</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tight mb-6 uppercase text-white">
                        SUPPORTED <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">STACKS</span>
                    </h2>
                    <p className="text-xl font-mono text-muted-foreground leading-relaxed">
                        // Kybernus configures the best tools for your mission. <br />
                        <span className="text-sm font-bold text-tech-purple mt-2 block">
                            Production-ready architectures available for all stacks.
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {stacks.map((stack, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative bg-tech-gray/20 backdrop-blur-sm p-8 border border-white/5 hover:border-tech-blue/50 transition-all duration-300"
                        >
                            {/* Tech Borders */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-tech-blue transition-colors" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 group-hover:border-tech-blue transition-colors" />

                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 bg-tech-black border border-white/10 group-hover:border-tech-blue/50 transition-colors`}>
                                    <stack.icon className={`w-8 h-8 ${stack.color}`} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-space font-bold mb-3 text-white group-hover:text-tech-blue transition-colors">{stack.name}</h3>
                            <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-6 border-t border-white/5 pt-4">
                                {stack.description}
                            </p>

                            <div className="flex gap-2">
                                <div className="h-0.5 flex-1 bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className={`h-full bg-tech-blue`}
                                    />
                                </div>
                            </div>

                            {/* Hover Scan Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tech-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
