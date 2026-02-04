"use client";

import { motion } from "framer-motion";
import { Terminal, Menu, X, Github, ChevronRight, Cpu, Book } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("fill-current", className)}
    >
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
);

const links = [
    { name: "Why Us", href: "/#why-us", icon: Terminal },
    { name: "Structure", href: "/#structure", icon: Cpu },
    { name: "Stacks", href: "/#stacks", icon: Book },
    { name: "Features", href: "/#features", icon: Terminal },
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
                        <div className="relative transition-transform group-hover:scale-110">
                            <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
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
                            <a href="https://discord.gg/M2GyVqX2hg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-tech-purple transition-colors">
                                <DiscordIcon className="w-5 h-5" />
                            </a>
                            <a href="https://github.com/ViniMTrevisan/Kybernus-CLI" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="/docs" className="group relative px-6 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-wider overflow-hidden hover:text-white transition-colors">
                                <span className="relative z-10">READ DOCS</span>
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
                        <a href="https://discord.gg/M2GyVqX2hg" target="_blank" className="py-4 bg-white/5 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center border border-white/10 hover:border-tech-purple/50 hover:text-tech-purple transition-colors">
                            <DiscordIcon className="w-4 h-4 mr-2" /> Discord
                        </a>
                        <a href="https://github.com/ViniMTrevisan/Kybernus-CLI" target="_blank" className="py-4 bg-white/5 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors">
                            <Github className="w-4 h-4 mr-2" /> GitHub
                        </a>
                        <a href="/docs" className="py-4 bg-tech-blue text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center hover:bg-tech-blue/90 transition-colors">
                            Read Docs
                        </a>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
}
