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
        <section id="features" className="py-24 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-4">
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Capabilities</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        ENGINEERED FOR <span className="text-cyber-blue">SCALE</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Stop building from zero. Leverage industry-standard architectures
                        and modern DevOps in a single command.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto justify-items-center"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative p-8 glass-dark rounded-2xl border border-white/10 hover:border-cyber-blue/30 transition-all duration-300 overflow-hidden"
                        >
                            {/* Card Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/5 to-cyber-purple/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl" />

                            <div className="relative z-10">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                                    feature.bg
                                )}>
                                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyber-blue transition-colors">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
