"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Stack = "nextjs" | "nodejs-express" | "java-spring" | "python-fastapi" | "nestjs";
type Architecture = "mvc" | "clean" | "hexagonal";

interface ArchTemplate {
    name: string;
    tier: "free" | "pro";
    description: string;
    screenshot: string | null; // null = placeholder
}

const stacks: { id: Stack; name: string }[] = [
    { id: "nextjs", name: "Next.js" },
    { id: "nodejs-express", name: "Node.js + Express" },
    { id: "java-spring", name: "Java Spring Boot" },
    { id: "python-fastapi", name: "Python FastAPI" },
    { id: "nestjs", name: "NestJS" },
];

const architectures: { id: Architecture; name: string; tier: "free" | "pro"; availableFor: Stack[] }[] = [
    {
        id: "mvc",
        name: "MVC Architecture",
        tier: "free",
        availableFor: ["java-spring", "nodejs-express"]  // Only Java and Node.js have free MVC
    },
    {
        id: "clean",
        name: "Clean Architecture",
        tier: "pro",
        availableFor: ["java-spring", "nodejs-express", "python-fastapi", "nestjs"] // No Next.js
    },
    {
        id: "hexagonal",
        name: "Hexagonal Architecture",
        tier: "pro",
        availableFor: ["java-spring", "nodejs-express", "python-fastapi", "nestjs"] // No Next.js
    },
];

// Placeholder data - screenshots will be added later
const templates: Record<Stack, Record<Architecture, ArchTemplate>> = {
    "nextjs": {
        "mvc": {
            name: "Next.js MVC",
            tier: "free",
            description: "Standard pages directory with API routes, components, and utilities.",
            screenshot: null,
        },
        "clean": {
            name: "Next.js Clean",
            tier: "pro",
            description: "Domain-driven design with use cases, entities, and infrastructure layers.",
            screenshot: null,
        },
        "hexagonal": {
            name: "Next.js Hexagonal",
            tier: "pro",
            description: "Ports & adapters pattern with strict layer boundaries and dependency inversion.",
            screenshot: null,
        },
    },
    "nodejs-express": {
        "mvc": {
            name: "Node.js MVC",
            tier: "free",
            description: "Classic Model-View-Controller with routes, controllers, and middleware.",
            screenshot: null,
        },
        "clean": {
            name: "Node.js Clean",
            tier: "pro",
            description: "Use case-driven architecture with domain isolation and dependency injection.",
            screenshot: null,
        },
        "hexagonal": {
            name: "Node.js Hexagonal",
            tier: "pro",
            description: "Port-based design with interchangeable adapters for databases and APIs.",
            screenshot: null,
        },
    },
    // Add other stacks similarly...
    "java-spring": {
        "mvc": { name: "Java Spring MVC", tier: "free", description: "Standard Spring MVC with controllers and services.", screenshot: null },
        "clean": { name: "Java Spring Clean", tier: "pro", description: "Domain-centric Spring architecture.", screenshot: null },
        "hexagonal": { name: "Java Spring Hexagonal", tier: "pro", description: "Ports & adapters with Spring DI.", screenshot: null },
    },
    "python-fastapi": {
        "mvc": { name: "FastAPI MVC", tier: "free", description: "Simple FastAPI with routers and services.", screenshot: "/architecture-demo.png" },
        "clean": { name: "FastAPI Clean", tier: "pro", description: "Clean architecture with FastAPI.", screenshot: null },
        "hexagonal": { name: "FastAPI Hexagonal", tier: "pro", description: "Hexagonal pattern with FastAPI.", screenshot: null },
    },
    "nestjs": {
        "mvc": { name: "NestJS MVC", tier: "free", description: "Classic NestJS module structure.", screenshot: null },
        "clean": { name: "NestJS Clean", tier: "pro", description: "Domain-driven NestJS.", screenshot: null },
        "hexagonal": { name: "NestJS Hexagonal", tier: "pro", description: "Ports & adapters with NestJS.", screenshot: null },
    },
};

export default function StructurePage() {
    const [selectedStack, setSelectedStack] = useState<Stack>("python-fastapi");

    return (
        <main className="min-h-screen bg-tech-black">
            <Navbar />

            <section className="py-24 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="container relative z-10 px-4">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-7xl font-space font-bold mb-6 uppercase text-white">
                            ARCHITECTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">EXPLORER</span>
                        </h1>
                        <p className="text-xl font-mono text-muted-foreground max-w-3xl mx-auto">
                            // Inspect every folder structure before you generate. <br />
                            <span className="text-tech-success">15 production templates</span>, 100% transparent.
                        </p>
                    </motion.div>

                    {/* Stack Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-16">
                        {stacks.map((stack) => (
                            <button
                                key={stack.id}
                                onClick={() => setSelectedStack(stack.id)}
                                className={`px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all ${selectedStack === stack.id
                                    ? "bg-tech-purple text-white"
                                    : "bg-tech-gray/30 text-muted-foreground hover:bg-tech-gray/50 border border-white/10"
                                    }`}
                            >
                                {stack.name}
                            </button>
                        ))}
                    </div>

                    {/* Architecture Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {architectures
                            .filter(arch => arch.availableFor.includes(selectedStack))
                            .map((arch) => {
                                const template = templates[selectedStack][arch.id];

                                return (
                                    <motion.div
                                        key={arch.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative group"
                                    >
                                        {/* Tier Badge */}
                                        <div className={`absolute -top-3 -right-3 z-10 px-3 py-1 text-xs font-mono font-bold uppercase ${arch.tier === "free" ? "bg-tech-blue" : "bg-tech-purple"
                                            } text-white flex items-center gap-1`}>
                                            {arch.tier === "pro" && <Lock className="w-3 h-3" />}
                                            {arch.tier}
                                        </div>

                                        {/* Card */}
                                        <div className="relative bg-tech-gray/30 border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all h-full flex flex-col">
                                            {/* Header */}
                                            <div className="bg-tech-gray/50 border-b border-white/10 px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                                        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                                    </div>
                                                    <span className="text-xs font-mono text-white font-bold">
                                                        {arch.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Screenshot */}
                                            <div className="p-4 bg-[#1e1e1e] flex-1">
                                                {template.screenshot ? (
                                                    <div className="relative rounded overflow-hidden border border-white/5 h-full">
                                                        <Image
                                                            src={template.screenshot}
                                                            alt={`${template.name} structure`}
                                                            width={400}
                                                            height={300}
                                                            className="w-full h-auto"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-48 flex items-center justify-center border border-white/5 rounded bg-black/40">
                                                        <p className="text-xs font-mono text-muted-foreground">
                                                            Screenshot coming soon...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="p-4 border-t border-white/10">
                                                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                                                    {template.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-20"
                    >
                        <p className="text-sm font-mono text-muted-foreground mb-6">
                            Ready to generate your own?
                        </p>
                        <a
                            href="/#install"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all"
                        >
                            <Check className="w-4 h-4" />
                            Get Started Free
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
