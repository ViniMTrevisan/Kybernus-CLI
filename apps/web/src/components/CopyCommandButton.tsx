"use client";

import { useState } from "react";
import { Terminal as TerminalIcon, Check, Copy } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence } from "framer-motion";

export function CopyCommandButton() {
    const [copied, setCopied] = useState(false);
    const posthog = usePostHog();
    const command = "npm install -g kybernus";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);

            // Track the copy event in PostHog
            posthog?.capture('cli_command_copied', {
                command: command,
                location: 'hero_section'
            });

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative group">
            {/* Pulsing Outer Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -inset-0.5 bg-tech-blue/30 rounded-lg blur-md group-hover:bg-tech-blue/50 transition-all duration-300"
            />

            <button
                onClick={handleCopy}
                className="relative inline-flex items-center gap-4 px-8 py-4 rounded-lg bg-tech-black border-2 border-tech-blue/30 text-white font-mono text-sm md:text-base hover:border-tech-blue/60 transition-all cursor-pointer overflow-hidden group shadow-[0_0_20px_rgba(0,210,255,0.1)]"
            >
                {/* Internal Glow on Hover */}
                <div className="absolute inset-0 bg-tech-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Check className="w-5 h-5 text-tech-success" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="terminal"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TerminalIcon className="w-5 h-5 text-tech-blue" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <span className="font-bold tracking-tight">
                        <span className="text-tech-blue/80">$</span> {command}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-tech-blue transition-colors">
                    {copied ? (
                        <span className="text-tech-success">Copied!</span>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy</span>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
}
