"use client";

import { motion } from "framer-motion";
import { Code2, Layers, Rocket, Shield, Zap, Package, Cpu, Globe, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberCard } from "@/components/ui/CyberCard";

const features = [
    {
        icon: Zap,
        title: "Instant Scaffolding",
        description: "Generate complex project structures in seconds. Architecture, DevOps, and Boilerplate—done.",
        color: "text-tech-blue",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-2",
        delay: 0
    },
    {
        icon: Layers,
        title: "Advanced Patterns",
        description: "Choose MVC, Clean, or Hexagonal Architecture. Battle-tested patterns.",
        color: "text-tech-purple",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-1",
        delay: 0.1
    },
    {
        icon: Cpu,
        title: "Multi-Stack Support",
        description: "Node.js, NestJS, Spring Boot, FastAPI, and Next.js. The right tool for every job.",
        color: "text-tech-success",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-1",
        delay: 0.2
    },
    {
        icon: Package,
        title: "DevOps Ready",
        description: "Docker, CI/CD pipelines, and Terraform configurations out of the box. Ship with confidence.",
        color: "text-tech-warning",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-2",
        delay: 0.3
    },
    {
        icon: Shield,
        title: "Hardened Security",
        description: "Environment handling, security headers, and best practices baked into every template.",
        color: "text-blue-400",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-1",
        delay: 0.4
    },
    {
        icon: Rocket,
        title: "AI Automation",
        description: "Automated documentation and API references generated via Google Gemini integration.",
        color: "text-tech-purple",
        glow: "group-hover:text-glow group-hover:scale-110",
        span: "md:col-span-2",
        delay: 0.5
    },
];

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: feature.delay }}
                            className={cn("h-full", feature.span)}
                        >
                            <CyberCard className="h-full hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="group">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center mb-6 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20"
                                        )}>
                                            <feature.icon className={cn("w-6 h-6 transition-all duration-300", feature.color, feature.glow)} />
                                        </div>
                                        <h3 className="text-2xl font-space font-bold mb-3 text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                </div>
                            </CyberCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
