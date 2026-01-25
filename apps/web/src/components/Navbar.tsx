"use client";

import { motion } from "framer-motion";
import { Terminal, Book, Cpu, CreditCard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const links = [
    { name: "Why Us", href: "/#why-us", icon: Terminal },
    { name: "Structure", href: "/#structure", icon: Cpu },
    { name: "Stacks", href: "/#stacks", icon: Book },
    { name: "Features", href: "/#features", icon: Terminal },
    { name: "Pricing", href: "/#pricing", icon: CreditCard },
    { name: "Docs", href: "/docs", icon: Book },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Top accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent opacity-50" />

            <div className={cn(
                "transition-all duration-300 border-b",
                scrolled
                    ? "bg-tech-black/80 backdrop-blur-xl border-white/5 py-4"
                    : "bg-transparent border-transparent py-6"
            )}>
                <div className="container max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="relative p-2 rounded bg-tech-gray border border-white/10 group-hover:border-tech-blue/50 transition-colors">
                            <Terminal className="w-5 h-5 text-tech-blue" />
                            {/* Corner accents */}
                            <div className="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-tech-blue/0 group-hover:border-tech-blue transition-colors" />
                            <div className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-tech-blue/0 group-hover:border-tech-blue transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-space font-bold tracking-tight text-white leading-none">KYBERNUS</span>
                            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em] leading-none mt-1">ORCHESTRATOR</span>
                        </div>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-10">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-space font-medium text-muted-foreground hover:text-tech-blue transition-colors flex items-center gap-2 group relative"
                            >
                                <span className="relative z-10">{link.name}</span>
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tech-blue transition-all group-hover:w-full" />
                            </a>
                        ))}

                        <div className="h-6 w-px bg-white/10 mx-2" />

                        <div className="flex items-center gap-4">
                            <a href="/login" className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">
                            // LOGIN
                            </a>
                            <a href="/register" className="group relative px-6 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider overflow-hidden hover:text-white transition-colors">
                                <span className="relative z-10">GET ACCESS</span>
                                <div className="absolute inset-0 bg-tech-blue transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            </a>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-white hover:text-tech-blue transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={mobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden bg-tech-black border-b border-white/10"
            >
                <div className="container max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
                    {links.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg font-space font-medium text-white hover:text-tech-blue flex items-center gap-4"
                        >
                            <div className="p-2 rounded bg-white/5 text-muted-foreground">
                                <link.icon className="w-5 h-5" />
                            </div>
                            {link.name}
                        </a>
                    ))}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                        <a href="/login" className="py-4 bg-white/5 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors">
                            Login
                        </a>
                        <a href="/register" className="py-4 bg-tech-blue text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center hover:bg-tech-blue/90 transition-colors">
                            Get Access
                        </a>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
}
