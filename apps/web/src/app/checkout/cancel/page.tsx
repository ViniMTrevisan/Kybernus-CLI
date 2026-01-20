"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyber-blue/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-lg w-full text-center"
            >
                {/* Cancel Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-8"
                >
                    <XCircle className="w-16 h-16 text-muted-foreground" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                    Payment <span className="text-muted-foreground">Cancelled</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8">
                    No worries! You can try again anytime. Your trial access is still active.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/#pricing"
                        className="px-6 py-3 bg-cyber-purple text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-cyber-purple/90 transition-all flex items-center justify-center gap-2"
                    >
                        View Pricing
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white/5 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 transition-all border border-white/10"
                    >
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
