'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Download, ExternalLink, Loader2, ArrowUpCircle } from 'lucide-react';
import link from 'next/link';

interface User {
    email: string;
    licenseKey: string;
    tier: string;
    status: string;
    projectUsage: number;
    projectLimit: number;
    trialEndsAt?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/user/me')
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                router.replace('/login');
            });
    }, [router]);

    const copyLicense = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const isTrial = user.status === 'TRIAL';
    const isFree = user.tier === 'FREE' && user.status !== 'TRIAL';
    const isPro = user.tier === 'PRO';

    const usagePercent = user.projectLimit === -1 ? 0 : (user.projectUsage / user.projectLimit) * 100;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 pointer-events-none" />

            <div className="container max-w-5xl mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded-xl">
                            <Terminal className="w-8 h-8 text-cyber-blue" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase text-white">Dashboard</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            // Implement logout (clear cookie)
                            document.cookie = 'user-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                            router.push('/login');
                        }}
                        className="text-sm text-muted-foreground hover:text-white transition-colors uppercase font-bold tracking-widest"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* License Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-dark border border-white/10 rounded-2xl p-8"
                    >
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">License Key</h2>

                        <div className="relative group">
                            <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-lg text-cyber-blue truncate pr-12">
                                {user.licenseKey}
                            </div>
                            <button
                                onClick={copyLicense}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isPro ? 'bg-purple-500/10 text-purple-400' : isTrial ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                {isPro ? 'Pro Lifetime' : isTrial ? 'Trial Active' : 'Free Plan'}
                            </span>

                            {isTrial && (
                                <span className="text-xs text-muted-foreground">
                                    Expires {new Date(user.trialEndsAt!).toLocaleDateString()}
                                </span>
                            )}

                            {isFree && (
                                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                                    MVC Only • 3 Stacks
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Usage Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-dark border border-white/10 rounded-2xl p-8"
                    >
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Project Usage</h2>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white font-bold">{user.projectUsage} created</span>
                                <span className="text-muted-foreground">
                                    {isPro ? 'Unlimited' : `${user.projectLimit} limit`}
                                </span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    className={`h-full ${isPro ? 'bg-cyber-purple' : usagePercent >= 100 ? 'bg-red-500' : 'bg-cyber-blue'}`}
                                />
                            </div>
                        </div>

                        {isTrial && usagePercent >= 66 && (
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
                                <ArrowUpCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                                <div>
                                    <p className="text-sm text-yellow-200 mb-2">Running out of projects?</p>
                                    <a href="/#pricing" className="text-xs font-bold uppercase tracking-widest text-yellow-500 hover:text-yellow-400">Upgrade to Pro &rarr;</a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <a href="/docs/getting_started" className="p-6 glass-dark border border-white/10 rounded-2xl hover:bg-white/5 transition-colors group">
                        <Download className="w-6 h-6 text-white mb-4 group-hover:text-cyber-blue transition-colors" />
                        <h3 className="font-bold text-white mb-2">Install CLI</h3>
                        <p className="text-sm text-muted-foreground">Get started with standard installation instructions.</p>
                    </a>

                    <a href="/docs" className="p-6 glass-dark border border-white/10 rounded-2xl hover:bg-white/5 transition-colors group">
                        <ExternalLink className="w-6 h-6 text-white mb-4 group-hover:text-cyber-purple transition-colors" />
                        <h3 className="font-bold text-white mb-2">Documentation</h3>
                        <p className="text-sm text-muted-foreground">Browse guides, references and examples.</p>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
