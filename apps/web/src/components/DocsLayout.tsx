"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, ChevronRight, Menu, X, Command, Terminal, Sparkles, Layers } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const docNavigation = [
    {
        title: 'Getting Started',
        slug: 'getting_started',
        icon: Sparkles
    },
    {
        title: 'CLI Reference',
        slug: 'cli_reference',
        icon: Terminal
    },
    {
        title: 'Supported Stacks',
        slug: 'stacks',
        icon: Layers
    },
    {
        title: 'Core Concepts',
        slug: 'core_concepts',
        icon: Book
    }
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Docs Header */}
            <header className="sticky top-0 z-50 w-full glass-dark border-b border-border">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative group-hover:scale-110 transition-transform">
                                <Image src="/kybernus-new.png" alt="Kybernus" width={60} height={60} className="object-contain" />
                            </div>
                        </Link>
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <span className="text-sm font-medium text-muted-foreground hidden sm:block">Documentation</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            Back to Site
                        </Link>
                        <button
                            className="lg:hidden p-2 text-muted-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="container flex-1 items-start lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4">
                {/* Sidebar Desktop */}
                <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r border-border lg:sticky lg:block py-8 pr-4">
                    <nav className="flex flex-col gap-2">
                        {docNavigation.map((item) => {
                            const isActive = pathname === `/docs/${item.slug}`;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.slug}
                                    href={`/docs/${item.slug}`}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-cyber-blue" : "group-hover:text-cyber-blue transition-colors")} />
                                    {item.title}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-blue shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="fixed inset-0 z-40 bg-background lg:hidden pt-20 px-4"
                        >
                            <nav className="flex flex-col gap-4">
                                {docNavigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.slug}
                                            href={`/docs/${item.slug}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border text-lg font-medium"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-cyber-blue" />
                                            </div>
                                            {item.title}
                                            <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <main className="relative py-8 lg:py-12">
                    <div className="mx-auto w-full min-w-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 
