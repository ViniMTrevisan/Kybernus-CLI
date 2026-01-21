"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowRight, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-tech-error/10 via-transparent to-black pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 border border-tech-error/30 bg-tech-error/10 relative">
                        <div className="absolute top-0 left-0 w-1 h-1 bg-tech-error" />
                        <div className="absolute bottom-0 right-0 w-1 h-1 bg-tech-error" />
                        <AlertTriangle className="w-12 h-12 text-tech-error" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-space uppercase tracking-tight mb-2 text-white">
                    Transaction <span className="text-tech-error">Aborted</span>
                </h1>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-error/10 border border-tech-error/30 rounded-full mb-8">
                    <div className="w-1.5 h-1.5 bg-tech-error animate-pulse rounded-full" />
                    <span className="text-[10px] font-mono font-bold text-tech-error uppercase tracking-widest">
                        Process Terminated
                    </span>
                </div>

                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative mb-8">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

                    <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                        // Payment sequence interrupted by user or system.<br />
                        Trial protocols remain active. You may re-initiate the upgrade sequence at any time.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/#pricing"
                        className="px-6 py-3 bg-white text-black font-mono font-bold uppercase tracking-widest text-xs hover:bg-tech-gray transition-all flex items-center justify-center gap-2 group"
                    >
                        Review Pricing
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-transparent border border-white/10 text-white font-mono font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
