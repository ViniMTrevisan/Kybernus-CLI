"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Terminal, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("kybernus login");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-cyber-blue/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-lg w-full text-center"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex p-6 rounded-full bg-neon-green/10 border border-neon-green/20 mb-8"
                >
                    <CheckCircle className="w-16 h-16 text-neon-green" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                    Payment <span className="text-neon-green">Successful!</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8">
                    Your Kybernus CLI license has been activated. Check your email for your new license key.
                </p>

                {/* Instructions Card */}
                <div className="glass-dark border border-white/10 rounded-2xl p-8 mb-8 text-left">
                    <h3 className="text-sm font-black uppercase tracking-widest text-cyber-blue mb-4">
                        Next Steps
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-cyber-blue">1</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Check your email for your new license key
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-cyber-blue">2</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Run this command in your terminal:
                                </p>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-3 bg-black/50 rounded-lg border border-white/10 hover:border-cyber-blue/30 transition-all group w-full"
                                >
                                    <Terminal className="w-4 h-4 text-cyber-blue" />
                                    <code className="text-sm text-neon-green flex-1 text-left">kybernus login</code>
                                    <Copy className={`w-4 h-4 transition-colors ${copied ? 'text-neon-green' : 'text-muted-foreground group-hover:text-white'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-cyber-blue">3</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter your new license key when prompted
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/docs"
                        className="px-6 py-3 bg-cyber-blue text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-cyber-blue/90 transition-all flex items-center justify-center gap-2"
                    >
                        View Documentation
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

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
