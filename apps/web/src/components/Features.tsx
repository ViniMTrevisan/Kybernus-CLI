"use client";

import { motion } from "framer-motion";
import { Code2, Layers, Rocket, Shield, Zap, Package, Cpu, Globe, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: Zap,
        title: "Instant Scaffolding",
        description: "Generate complex project structures in seconds. Architecture, DevOps, and Boilerplate—done.",
        color: "text-cyber-blue",
        bg: "bg-cyber-blue/10",
    },
    {
        icon: Layers,
        title: "Advanced Patterns",
        description: "Choose MVC, Clean, or Hexagonal Architecture. Battle-tested patterns for enterprise scale.",
        color: "text-cyber-purple",
        bg: "bg-cyber-purple/10",
    },
    {
        icon: Cpu,
        title: "Multi-Stack Support",
        description: "Node.js, NestJS, Spring Boot, FastAPI, and Next.js. The right tool for every job.",
        color: "text-neon-green",
        bg: "bg-neon-green/10",
    },
    {
        icon: Package,
        title: "DevOps Ready",
        description: "Docker, CI/CD pipelines, and Terraform configurations out of the box. Ship with confidence.",
        color: "text-cyber-pink",
        bg: "bg-cyber-pink/10",
    },
    {
        icon: Shield,
        title: "Hardened Security",
        description: "Environment handling, security headers, and best practices baked into every template.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    {
        icon: Rocket,
        title: "AI Automation",
        description: "Automated documentation and API references generated via Google Gemini integration.",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export function Features() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-tech-black">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-tech-blue/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6">
                        <Layers className="w-3 h-3 text-tech-purple" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-purple">Capabilities</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 tracking-tight text-white">
                        ENGINEERED FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">SCALE</span>
                    </h2>
                    <p className="text-xl font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        // Stop building from zero. <br />
                        Leverage industry-standard architectures and modern DevOps in a single command.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group relative p-8 bg-tech-gray/20 backdrop-blur-sm border border-white/5 hover:border-tech-blue/50 transition-all duration-300"
                        >
                            {/* Tech Borders - Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-tech-blue transition-colors" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 group-hover:border-tech-blue transition-colors" />

                            <div className="relative z-10">
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center mb-6 bg-tech-black border border-white/10 group-hover:border-tech-blue/50 transition-colors"
                                )}>
                                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                                </div>
                                <h3 className="text-xl font-space font-bold mb-3 text-white group-hover:text-tech-blue transition-colors flex items-center gap-2">
                                    {feature.title}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-tech-blue text-xs font-mono">→</span>
                                </h3>
                                <p className="text-sm font-mono text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Hover Scan Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tech-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
