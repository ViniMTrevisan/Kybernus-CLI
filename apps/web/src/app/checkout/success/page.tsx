"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Terminal, Copy, ArrowRight, ShieldCheck } from "lucide-react";
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
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-tech-success/10 via-transparent to-tech-blue/5 pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 border border-tech-success/30 bg-tech-success/10 relative">
                            <div className="absolute top-0 left-0 w-1 h-1 bg-tech-success" />
                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-tech-success" />
                            <ShieldCheck className="w-12 h-12 text-tech-success" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold font-space uppercase tracking-tight mb-2 text-white">
                        Transaction <span className="text-tech-success">Complete</span>
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-success/10 border border-tech-success/30 rounded-full mb-4">
                        <div className="w-1.5 h-1.5 bg-tech-success animate-pulse rounded-full" />
                        <span className="text-[10px] font-mono font-bold text-tech-success uppercase tracking-widest">
                            Access Granted
                        </span>
                    </div>
                </div>

                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative mb-8">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-tech-blue mb-6 border-b border-white/5 pb-2">
                        Initialization Sequence
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-none border border-tech-blue/50 bg-tech-blue/10 flex items-center justify-center text-xs font-mono font-bold text-tech-blue">
                                    01
                                </div>
                                <div className="w-[1px] h-full bg-white/10 my-1" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Check Inbox</h4>
                                <p className="text-xs text-muted-foreground font-mono">
                                    License key dispatched to registered email.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-none border border-tech-blue/50 bg-tech-blue/10 flex items-center justify-center text-xs font-mono font-bold text-tech-blue">
                                    02
                                </div>
                                <div className="w-[1px] h-full bg-white/10 my-1" />
                            </div>
                            <div className="w-full">
                                <h4 className="text-sm font-bold text-white mb-2">Execute Login</h4>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-3 bg-black/50 border border-white/10 hover:border-tech-success/50 transition-all group w-full text-left"
                                >
                                    <Terminal className="w-3 h-3 text-tech-success" />
                                    <code className="text-sm font-mono text-white flex-1">kybernus login</code>
                                    <Copy className={`w-3 h-3 transition-colors ${copied ? 'text-tech-success' : 'text-muted-foreground group-hover:text-white'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-none border border-tech-blue/50 bg-tech-blue/10 flex items-center justify-center text-xs font-mono font-bold text-tech-blue shrink-0">
                                03
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Authenticate</h4>
                                <p className="text-xs text-muted-foreground font-mono">
                                    Input license key when prompted by CLI.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/docs"
                        className="px-6 py-3 bg-tech-blue text-black font-mono font-bold uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-2 group"
                    >
                        Documentation
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

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-tech-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-tech-blue/30 border-t-tech-blue rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
