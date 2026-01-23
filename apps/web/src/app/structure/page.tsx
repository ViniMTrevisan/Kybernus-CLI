"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check, Lock, Info } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Stack = "nextjs" | "nodejs-express" | "java-spring" | "python-fastapi" | "nestjs";
type ArchitectureSlot = "slot1" | "slot2" | "slot3";

interface ArchTemplate {
    name: string;
    tier: "free" | "pro";
    description: string;
    screenshot: string | null;
}

const stacks: { id: Stack; name: string }[] = [
    { id: "nextjs", name: "Next.js" },
    { id: "nodejs-express", name: "Node.js + Express" },
    { id: "java-spring", name: "Java Spring Boot" },
    { id: "python-fastapi", name: "Python FastAPI" },
    { id: "nestjs", name: "NestJS" },
];

// Configuration for what to show for each stack
const getStackConfig = (stack: Stack): { id: ArchitectureSlot; label: string }[] => {
    switch (stack) {
        case "nextjs":
            return [
                { id: "slot1", label: "Default Structure (Free)" },
                { id: "slot2", label: "Default Structure (Pro)" },
            ];
        default:
            return [
                { id: "slot1", label: "MVC Architecture" },
                { id: "slot2", label: "Clean Architecture" },
                { id: "slot3", label: "Hexagonal Architecture" },
            ];
    }
};

const templates: Record<Stack, Record<string, ArchTemplate>> = {
    "nextjs": {
        "slot1": {
            name: "Next.js Default",
            tier: "free",
            description: "Modern Next.js 13+ with App Router, Server Components, and TypeScript.",
            screenshot: "/next-free.png",
        },
        "slot2": {
            name: "Next.js Pro",
            tier: "pro",
            description: "Production-ready structure with Auth, Dashboard, Infra, and Docker configured.",
            screenshot: null, // Placeholder for Pro screenshot
        },
    },
    "nodejs-express": {
        "slot1": {
            name: "Node.js MVC",
            tier: "free",
            description: "Classic Model-View-Controller with routes, controllers, and middleware.",
            screenshot: "/node-mvc.png",
        },
        "slot2": {
            name: "Node.js Clean",
            tier: "pro",
            description: "Use case-driven architecture with domain isolation and dependency injection.",
            screenshot: "/node-clean.png",
        },
        "slot3": {
            name: "Node.js Hexagonal",
            tier: "pro",
            description: "Port-based design with interchangeable adapters for databases and APIs.",
            screenshot: "/node-hexagonal.png",
        },
    },
    "java-spring": {
        "slot1": {
            name: "Java Spring MVC",
            tier: "free",
            description: "Standard Spring MVC with controllers, services, and repository pattern.",
            screenshot: "/java-mvc.png"
        },
        "slot2": {
            name: "Java Spring Clean",
            tier: "pro",
            description: "Domain-centric Spring architecture with clear separation of concerns.",
            screenshot: "/java-clean.png"
        },
        "slot3": {
            name: "Java Spring Hexagonal",
            tier: "pro",
            description: "Ports & adapters pattern with Spring dependency injection.",
            screenshot: "/java-hexagonal.png"
        },
    },
    "python-fastapi": {
        "slot1": {
            name: "FastAPI MVC",
            tier: "pro", // Python MVC is PRO
            description: "FastAPI with routers, services, and async repository pattern.",
            screenshot: "/python-mvc.png"
        },
        "slot2": {
            name: "FastAPI Clean",
            tier: "pro",
            description: "Clean architecture with domain entities and use cases.",
            screenshot: "/python-clean.png"
        },
        "slot3": {
            name: "FastAPI Hexagonal",
            tier: "pro",
            description: "Hexagonal pattern with ports and adapters for FastAPI.",
            screenshot: "/python-hexagonal.png"
        },
    },
    "nestjs": {
        "slot1": {
            name: "NestJS MVC",
            tier: "pro", // NestJS MVC is PRO
            description: "NestJS with controllers, services, and module organization.",
            screenshot: "/nest-mvc.png"
        },
        "slot2": {
            name: "NestJS Clean",
            tier: "pro",
            description: "Domain-driven NestJS with clean architecture principles.",
            screenshot: "/nest-clean.png"
        },
        "slot3": {
            name: "NestJS Hexagonal",
            tier: "pro",
            description: "Ports & adapters with NestJS modules and providers.",
            screenshot: "/nest-hexagonal.png"
        },
    },
};

export default function StructurePage() {
    const [selectedStack, setSelectedStack] = useState<Stack>("python-fastapi");
    const activeConfig = getStackConfig(selectedStack);

    return (
        <main className="min-h-screen bg-tech-black">
            <Navbar />

            <section className="py-24 relative overflow-hidden min-h-[100vh]">
                {/* Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="container relative z-10 px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-space font-bold mb-6 uppercase text-white">
                            ARCHITECTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">EXPLORER</span>
                        </h1>
                        <p className="text-xl font-mono text-muted-foreground max-w-3xl mx-auto">
                            // Inspect every folder structure before you generate. <br />
                            <span className="text-tech-success">15 production templates</span>, 100% transparent.
                        </p>
                    </div>

                    {/* Stack Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-16">
                        {stacks.map((stack) => (
                            <button
                                key={stack.id}
                                onClick={() => setSelectedStack(stack.id)}
                                className={`px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all rounded ${selectedStack === stack.id
                                        ? "bg-tech-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                                        : "bg-tech-gray/30 text-muted-foreground hover:bg-tech-gray/50 border border-white/10 hover:border-white/20"
                                    }`}
                            >
                                {stack.name}
                            </button>
                        ))}
                    </div>

                    {/* Architecture Cards with AnimatePresence */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedStack}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`grid grid-cols-1 ${activeConfig.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-7xl'} gap-8 mx-auto`}
                        >
                            {activeConfig.map((slot) => {
                                const template = templates[selectedStack][slot.id];
                                if (!template) return null;

                                return (
                                    <div key={slot.id} className="relative group h-full">
                                        {/* Tier Badge */}
                                        <div className={`absolute -top-3 -right-3 z-20 px-3 py-1 text-xs font-mono font-bold uppercase ${template.tier === "free" ? "bg-tech-blue" : "bg-tech-purple"
                                            } text-white flex items-center gap-1 shadow-lg`}>
                                            {template.tier === "pro" && <Lock className="w-3 h-3" />}
                                            {template.tier}
                                        </div>

                                        {/* Card */}
                                        <div className="relative bg-tech-gray/30 border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all h-full flex flex-col group-hover:bg-tech-gray/40">
                                            {/* Header */}
                                            <div className="bg-tech-gray/50 border-b border-white/10 px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                                        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                                    </div>
                                                    <span className="text-xs font-mono text-white font-bold ml-2">
                                                        {slot.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Screenshot */}
                                            <div className="p-4 bg-[#1e1e1e] flex-1 min-h-[250px] relative">
                                                {template.screenshot ? (
                                                    <div className="relative rounded overflow-hidden border border-white/5 h-full aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500">
                                                        <Image
                                                            src={template.screenshot}
                                                            alt={`${template.name} structure`}
                                                            fill
                                                            className="object-contain object-top"
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center border border-white/5 rounded bg-black/40 p-6 text-center">
                                                        <Info className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                                                        <p className="text-xs font-mono text-muted-foreground">
                                                            Screenshot not available yet.
                                                            <br />
                                                            <span className="opacity-50 text-[10px] mt-2 block">
                                                                (Generate this project to verify)
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="p-4 border-t border-white/10 bg-tech-gray/20">
                                                <h3 className="font-bold text-white text-sm mb-1">{template.name}</h3>
                                                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                                                    {template.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom CTA */}
                    <div className="text-center mt-20">
                        <p className="text-sm font-mono text-muted-foreground mb-6">
                            Ready to generate your own?
                        </p>
                        <a
                            href="/#install"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all rounded"
                        >
                            <Check className="w-4 h-4" />
                            Get Started Free
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
