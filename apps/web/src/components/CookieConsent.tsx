'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consented = localStorage.getItem('kybernus-cookie-consent');
        if (!consented) {
            // Show banner after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('kybernus-cookie-consent', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4"
                >
                    <div className="container max-w-4xl mx-auto">
                        <div className="bg-tech-black/90 backdrop-blur-xl border border-tech-blue/20 p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Tech Borders */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tech-blue/50" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tech-blue/50" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tech-blue/50" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tech-blue/50" />

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-tech-blue/10 border border-tech-blue/20 mt-1">
                                    <Cookie className="w-5 h-5 text-tech-blue" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-space font-bold text-white uppercase tracking-wide">
                                        Privacy Protocol Initiated
                                    </h3>
                                    <p className="text-xs font-mono text-muted-foreground max-w-lg leading-relaxed">
                                        We use cookies to ensure the integrity of our command systems and user sessions. By continuing to use Kybernus, you acknowledge our data handling protocols.
                                    </p>
                                    <div className="flex gap-4">
                                        <Link href="/privacy" className="text-xs font-mono text-tech-blue hover:text-white transition-colors uppercase decoration-tech-blue/30 underline underline-offset-4">
                                            View Privacy Policy
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={handleAccept}
                                    className="px-6 py-2 bg-tech-blue text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors whitespace-nowrap w-full md:w-auto"
                                >
                                    Acknowledge
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)} // Just dismiss for session
                                    className="p-2 text-muted-foreground hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
