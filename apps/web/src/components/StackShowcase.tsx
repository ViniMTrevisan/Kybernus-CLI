"use client";

import { motion } from "framer-motion";
import { Server, Globe, Database, Cpu, Cloud, Laptop } from "lucide-react";
import { CyberCard } from "@/components/ui/CyberCard";
import { cn } from "@/lib/utils";

const stacks = [
    {
        name: "NestJS",
        description: "Enterprise-grade Node.js framework.",
        icon: Server,
        color: "text-tech-blue",
        glow: "group-hover:border-tech-blue/50 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]",
        tech: "BACKEND"
    },
    {
        name: "Next.js",
        description: "The React framework for production.",
        icon: Globe,
        color: "text-white",
        glow: "group-hover:border-white/50 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        tech: "FULLSTACK"
    },
    {
        name: "Spring Boot",
        description: "Java framework for microservices.",
        icon: Database,
        color: "text-tech-success",
        glow: "group-hover:border-tech-success/50 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
        tech: "BACKEND"
    },
    {
        name: "FastAPI",
        description: "High-performance Python APIs.",
        icon: Cpu,
        color: "text-tech-purple",
        glow: "group-hover:border-tech-purple/50 group-hover:shadow-[0_0_20px_rgba(176,38,255,0.1)]",
        tech: "BACKEND"
    },
    {
        name: "Express.js",
        description: "Minimalist Node.js framework.",
        icon: Laptop,
        color: "text-pink-500",
        glow: "group-hover:border-pink-500/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.1)]",
        tech: "BACKEND"
    },
    {
        name: "Terraform",
        description: "Infrastructure as Code.",
        icon: Cloud,
        color: "text-blue-400",
        glow: "group-hover:border-blue-400/50 group-hover:shadow-[0_0_20px_rgba(96,165,250,0.1)]",
        tech: "DEVOPS"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {stacks.map((stack, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <CyberCard variant="glass" className={cn("h-full transition-all duration-300", stack.glow)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 bg-white/5 rounded-lg border border-white/10 transition-all duration-300 group-hover:bg-white/10",
                                        "group-hover:scale-110",
                                        stack.color
                                    )}>
                                        <stack.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-space font-bold text-white group-hover:text-glow transition-all">{stack.name}</h3>
                                            <span className="text-[10px] font-mono text-white/40 border border-white/10 px-2 py-0.5 rounded-full group-hover:border-white/30 transition-colors uppercase">{stack.tech}</span>
                                        </div>
                                        <p className="text-xs font-mono text-muted-foreground group-hover:text-white/60 transition-colors">
                                            {stack.description}
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
