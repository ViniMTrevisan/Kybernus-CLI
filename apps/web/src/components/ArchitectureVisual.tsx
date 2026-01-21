"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Layers, Shield, Box, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const architectures = [
    {
        id: "mvc",
        name: "MVC Architecture",
        tag: "Standard",
        description: "Classic Model-View-Controller pattern. Simplifies development by decoupling data, logic, and presentation.",
        layers: [
            { name: "Controller", color: "bg-blue-500", desc: "Handles user input and coordinates responses." },
            { name: "Service", color: "bg-cyan-500", desc: "Contains business logic and rules." },
            { name: "Model", color: "bg-teal-500", desc: "Represents data structure and database schema." },
        ],
        benefit: "Rapid development for early-stage startups and MVPs.",
    },
    {
        id: "clean",
        name: "Clean Architecture",
        tag: "Professional",
        description: "Layered architecture emphasizing independence from frameworks, databases, and external agencies.",
        layers: [
            { name: "External (DB, UI)", color: "bg-purple-600 text-white", desc: "Outer layer for frameworks and tools." },
            { name: "Adapters", color: "bg-purple-500 text-white", desc: "Converts data for internal use case consumption." },
            { name: "Use Cases", color: "bg-tech-blue text-black", desc: "Application-specific business rules." },
            { name: "Entities", color: "bg-white text-black", desc: "The core, stable business rules and data models." },
        ],
        benefit: "Maximum testability and long-term maintainability for complex systems.",
    },
    {
        id: "hex",
        name: "Hexagonal Architecture",
        tag: "Enterprise",
        description: "Ports and Adapters pattern. Decouples the core business logic from its infrastructure.",
        layers: [
            { name: "Infrastructure (Adapters)", color: "bg-pink-600 text-white", desc: "External triggers (HTTP, CLI) and data sinks (DB, Cloud)." },
            { name: "Application (Ports)", color: "bg-tech-purple text-white", desc: "Interfaces for external communication." },
            { name: "Domain Core", color: "bg-tech-blue text-black", desc: "Pure business logic, isolated and protected." },
        ],
        benefit: "High flexibility and easy replacement of infrastructure components.",
    },
];

export function ArchitectureVisual() {
    const [active, setActive] = useState(architectures[1]);

    return (
        <section id="architecture" className="py-32 relative overflow-hidden bg-tech-black">
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6">
                        <Layers className="w-3 h-3 text-tech-purple" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-purple">System Architecture</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tight mb-6 text-white uppercase">
                        CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-purple to-tech-blue">FOUNDATION</span>
                    </h2>
                    <p className="text-xl font-mono text-muted-foreground max-w-2xl mx-auto">
                        // Kybernus isn't just a boilerplate. It's an architect in your CLI, <br />
                        enforcing battle-tested patterns from day one.
                    </p>
                </motion.div>

                <div className="relative bg-tech-zinc/30 backdrop-blur-md border border-white/10 p-8 md:p-16 max-w-7xl mx-auto overflow-hidden">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        {/* Visual Part */}
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="relative w-full max-w-sm flex flex-col items-center gap-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active.id}
                                        initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
                                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                        exit={{ opacity: 0, scale: 1.1, rotateX: -45 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                        className="w-full flex flex-col items-center gap-3 perspective-1000"
                                    >
                                        {active.layers.map((layer, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ z: -100 * i, opacity: 0 }}
                                                animate={{ z: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={cn(
                                                    "w-full py-4 px-8 flex items-center justify-center text-black font-mono font-bold uppercase tracking-tight text-sm shadow-xl border border-black/10 relative",
                                                    layer.color
                                                )}
                                                style={{ width: `${100 - i * 10}%` }}
                                            >
                                                {/* Tech Markers on Layers */}
                                                <div className="absolute top-1 left-1 w-1 h-1 bg-black/20" />
                                                <div className="absolute bottom-1 right-1 w-1 h-1 bg-black/20" />
                                                {layer.name}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Visual Glow */}
                                <div className="absolute -inset-10 bg-tech-purple/10 blur-[60px] rounded-full pointer-events-none" />
                            </div>
                        </div>

                        {/* Content Part */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-10">
                                {architectures.map((arch) => (
                                    <button
                                        key={arch.id}
                                        onClick={() => setActive(arch)}
                                        className={cn(
                                            "px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all border",
                                            active.id === arch.id
                                                ? "bg-tech-purple text-white border-tech-purple shadow-[0_0_15px_rgba(176,38,255,0.3)]"
                                                : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30 hover:text-white"
                                        )}
                                    >
                                        {arch.name.split(" ")[0]}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h3 className="text-3xl font-space font-bold mb-4 flex items-center gap-3 uppercase text-white">
                                        {active.name}
                                        <span className="text-[10px] px-2 py-0.5 border border-tech-purple/50 text-tech-purple font-mono">
                                            {active.tag}
                                        </span>
                                    </h3>
                                    <p className="text-muted-foreground font-mono leading-relaxed mb-10 text-sm">
                                        {active.description}
                                    </p>

                                    <div className="space-y-6 mb-10">
                                        {active.layers.map((layer, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className={cn("w-1 h-auto group-hover:scale-y-125 transition-transform origin-top", layer.color)} />
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase tracking-wider mb-1 font-space">{layer.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{layer.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-tech-purple/5 border border-tech-purple/20 flex items-center gap-4 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-tech-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Shield className="w-5 h-5 text-tech-purple relative z-10" />
                                        <span className="text-sm font-bold text-tech-purple uppercase tracking-wider font-mono relative z-10">
                                            {active.benefit}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
