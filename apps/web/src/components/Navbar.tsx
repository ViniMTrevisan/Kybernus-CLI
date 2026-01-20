"use client";

import { motion } from "framer-motion";
import { Terminal, Book, Cpu, CreditCard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const links = [
    { name: "Stacks", href: "#stacks", icon: Cpu },
    { name: "Features", href: "#features", icon: Terminal },
    { name: "Pricing", href: "#pricing", icon: CreditCard },
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
        <nav className="fixed top-6 left-0 right-0 z-50 px-4">
            <div className={cn(
                "container max-w-4xl mx-auto rounded-2xl transition-all duration-300 border",
                scrolled
                    ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-2xl py-3"
                    : "bg-transparent border-transparent py-5"
            )}>
                <div className="flex items-center justify-between px-6">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 group-hover:bg-cyber-blue/20 transition-all">
                            <Terminal className="w-5 h-5 text-cyber-blue" />
                        </div>
                        <span className="text-lg font-black uppercase tracking-tighter text-white">Kybernus</span>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-cyber-blue transition-colors flex items-center gap-2"
                            >
                                {link.name}
                            </a>
                        ))}
                        <button className="px-5 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyber-blue hover:text-white transition-all active:scale-95">
                            Launch App
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-white"
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
                className="md:hidden overflow-hidden container max-w-4xl mx-auto mt-2 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/10"
            >
                <div className="flex flex-col gap-4 p-6">
                    {links.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-cyber-blue py-2 flex items-center gap-3"
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </a>
                    ))}
                    <button className="w-full mt-4 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl">
                        Launch App
                    </button>
                </div>
            </motion.div>
        </nav>
    );
}
