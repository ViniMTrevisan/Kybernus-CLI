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
            { name: "External (DB, UI)", color: "bg-purple-600", desc: "Outer layer for frameworks and tools." },
            { name: "Adapters", color: "bg-purple-500", desc: "Converts data for internal use case consumption." },
            { name: "Use Cases", color: "bg-cyber-blue", desc: "Application-specific business rules." },
            { name: "Entities", color: "bg-white", desc: "The core, stable business rules and data models." },
        ],
        benefit: "Maximum testability and long-term maintainability for complex systems.",
    },
    {
        id: "hex",
        name: "Hexagonal Architecture",
        tag: "Enterprise",
        description: "Ports and Adapters pattern. Decouples the core business logic from its infrastructure.",
        layers: [
            { name: "Infrastructure (Adapters)", color: "bg-pink-600", desc: "External triggers (HTTP, CLI) and data sinks (DB, Cloud)." },
            { name: "Application (Ports)", color: "bg-cyber-purple", desc: "Interfaces for external communication." },
            { name: "Domain Core", color: "bg-cyber-blue", desc: "Pure business logic, isolated and protected." },
        ],
        benefit: "High flexibility and easy replacement of infrastructure components.",
    },
];

export function ArchitectureVisual() {
    const [active, setActive] = useState(architectures[1]);

    return (
        <section id="architecture" className="py-24 relative overflow-hidden">
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 mb-4">
                        <Layers className="w-3 h-3 text-cyber-purple" />
                        <span className="text-xs font-bold tracking-widest uppercase text-cyber-purple">Architecture Masterclass</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        CHOOSE YOUR <span className="text-cyber-purple text-glow">FOUNDATION</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Kybernus isn't just a boilerplate. It's an architect in your CLI,
                        enforcing battle-tested patterns from day one.
                    </p>
                </motion.div>

                <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-16 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                                                    "w-full py-4 px-8 rounded-2xl flex items-center justify-center text-black font-black uppercase tracking-tighter text-sm border-2 border-white/20 shadow-xl",
                                                    layer.color
                                                )}
                                                style={{ width: `${100 - i * 10}%` }}
                                            >
                                                {layer.name}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Visual Glow */}
                                <div className="absolute -inset-10 bg-cyber-purple/10 blur-[60px] rounded-full pointer-events-none" />
                            </div>
                        </div>

                        {/* Content Part */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {architectures.map((arch) => (
                                    <button
                                        key={arch.id}
                                        onClick={() => setActive(arch)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                            active.id === arch.id
                                                ? "bg-cyber-purple text-white shadow-lg"
                                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
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
                                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3 uppercase">
                                        {active.name}
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-cyber-purple/50 text-cyber-purple">
                                            {active.tag}
                                        </span>
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-8">
                                        {active.description}
                                    </p>

                                    <div className="space-y-6 mb-10">
                                        {active.layers.map((layer, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className={cn("w-1 h-auto rounded-full", layer.color)} />
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase tracking-wider mb-1">{layer.name}</div>
                                                    <div className="text-sm text-muted-foreground">{layer.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 rounded-xl bg-cyber-purple/5 border border-cyber-purple/20 flex items-center gap-4">
                                        <Shield className="w-5 h-5 text-cyber-purple" />
                                        <span className="text-sm font-bold text-cyber-purple uppercase italic tracking-tighter">
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
