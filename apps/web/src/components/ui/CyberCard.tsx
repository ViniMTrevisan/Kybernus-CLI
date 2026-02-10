"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface CyberCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "holo" | "glass";
    glowColor?: string;
}

export const CyberCard = ({ children, className, variant = "default", glowColor = "rgba(59, 130, 246, 0.5)" }: CyberCardProps) => {
    return (
        <div className={cn("relative group isolate", className)}>
            {/* Holographic Border / Glow Container */}
            <div
                className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
                }}
            />

            {/* Animated Glow Border */}
            <div className="absolute inset-[-2px] -z-20 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:inset-[-1px]" />

            {/* Main Content Background */}
            <div
                className={cn(
                    "relative h-full w-full rounded-xl border border-white/10 bg-tech-black/40 backdrop-blur-md overflow-hidden transition-all duration-300",
                    variant === "holo" && "bg-gradient-to-br from-white/5 to-transparent",
                    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500"
                )}
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
                }}
            >
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline pointer-events-none opacity-0 group-hover:opacity-100" />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-[1px] bg-white/20 group-hover:bg-tech-blue/50 transition-colors" />
                <div className="absolute top-0 left-0 w-[1px] h-4 bg-white/20 group-hover:bg-tech-blue/50 transition-colors" />

                <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-white/20 group-hover:bg-tech-purple/50 transition-colors" />
                {/* The angled corner handled by clip-path, so we position accent accordingly */}
                <div className="absolute bottom-[15%] right-0 w-[1px] h-8 bg-white/20 group-hover:bg-tech-purple/50 transition-colors origin-bottom" />

                <div className="p-6 relative z-10 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};
