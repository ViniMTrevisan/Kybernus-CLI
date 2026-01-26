'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, Check, Download, ExternalLink, ArrowUpCircle, ShieldCheck, Activity, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

interface User {
    email: string;
    licenseKey: string;
    tier: string;
    status: string;
    projectUsage: number;
    projectLimit: number;
    trialEndsAt?: Date | string | null;
}

interface DashboardClientProps {
    user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const copyLicense = () => {
        navigator.clipboard.writeText(user.licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isTrial = user.status === 'TRIAL';
    const isFree = user.tier === 'FREE' && user.status !== 'TRIAL';
    const isPro = user.tier === 'PRO';

    const usagePercent = user.projectLimit === -1 ? 0 : (user.projectUsage / user.projectLimit) * 100;
    const trialEnds = user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : '';

    return (
        <div className="min-h-screen bg-tech-black relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-tech-blue/5 pointer-events-none" />

            <div className="container max-w-5xl mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-space uppercase text-white tracking-widest">
                                Command <span className="text-tech-blue">Center</span>
                            </h1>
                            <p className="text-muted-foreground font-mono text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-tech-success animate-pulse" />
                                ONLINE // {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/profile')}
                            className="px-6 py-2 bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <UserIcon className="w-3 h-3" />
                            Profile
                        </button>
                        <button
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                router.push('/login');
                            }}
                            className="px-6 py-2 bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* License Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-tech-gray/20 border border-white/10 p-8 relative overflow-hidden group"
                    >
                        {/* Tech Borders */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Active License
                            </h2>
                            <ShieldCheck className="w-4 h-4 text-tech-success opacity-50" />
                        </div>

                        <div className="relative group/copy mb-6">
                            <div className="bg-black/50 border border-white/10 p-4 font-mono text-lg text-tech-blue truncate pr-12 tracking-wider">
                                {user.licenseKey}
                            </div>
                            <button
                                onClick={copyLicense}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-tech-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border ${isPro
                                ? 'bg-tech-purple/10 border-tech-purple/30 text-tech-purple'
                                : isTrial
                                    ? 'bg-tech-warning/10 border-tech-warning/30 text-tech-warning'
                                    : 'bg-white/5 border-white/10 text-muted-foreground'
                                }`}>
                                {isPro ? 'PRO ACCESS' : isTrial ? 'TRIAL MODE' : 'FREE TIER'}
                            </span>

                            {isTrial && (
                                <span className="text-[10px] font-mono text-muted-foreground border-l border-white/10 pl-3">
                                    EXPIRES: {trialEnds}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Usage Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-tech-gray/20 border border-white/10 p-8 relative overflow-hidden"
                    >
                        {/* Tech Borders */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Resource Usage
                            </h2>
                            <Activity className="w-4 h-4 text-tech-purple opacity-50" />
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-mono mb-2">
                                <span className="text-white font-bold uppercase">Projects Generated</span>
                                <span className="text-muted-foreground">
                                    {isPro ? 'UNLIMITED' : `${user.projectUsage} / ${user.projectLimit}`}
                                </span>
                            </div>
                            <div className="h-1 bg-white/5 w-full">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    className={`h-full ${isPro ? 'bg-tech-purple' : usagePercent >= 100 ? 'bg-tech-console' : 'bg-tech-blue'} relative`}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white text-[8px] leading-3 overflow-visible" />
                                </motion.div>
                            </div>
                        </div>

                        {isTrial && usagePercent >= 66 && (
                            <div className="p-3 bg-tech-warning/5 border border-tech-warning/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowUpCircle className="w-4 h-4 text-tech-warning shrink-0" />
                                    <span className="text-[10px] font-mono font-bold text-tech-warning uppercase">Approaching Limit</span>
                                </div>
                                <a href="/#pricing" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white hover:text-tech-warning transition-colors">
                                    Upgrade &gt;&gt;
                                </a>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                >
                    <a href="/docs/getting_started" className="p-6 bg-tech-gray/10 border border-white/5 hover:border-tech-blue/50 hover:bg-tech-blue/5 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-space font-bold text-white mb-1 group-hover:text-tech-blue transition-colors">CLI Installation</h3>
                                <p className="text-xs font-mono text-muted-foreground">Setup guide and requirements</p>
                            </div>
                            <Download className="w-5 h-5 text-white/50 group-hover:text-tech-blue transition-colors" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-tech-blue group-hover:w-full transition-all duration-500" />
                    </a>

                    <a href="/docs" className="p-6 bg-tech-gray/10 border border-white/5 hover:border-tech-purple/50 hover:bg-tech-purple/5 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-space font-bold text-white mb-1 group-hover:text-tech-purple transition-colors">Documentation</h3>
                                <p className="text-xs font-mono text-muted-foreground">Complete system reference</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-tech-purple transition-colors" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-tech-purple group-hover:w-full transition-all duration-500" />
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
