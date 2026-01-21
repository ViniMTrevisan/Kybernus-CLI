"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    TrendingUp,
    DollarSign,
    Activity,
    Terminal,
    LogOut,
    RefreshCw,
    BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardData {
    metrics: {
        total: {
            users: number;
            trial: number;
            free: number;
            pro: number;
        };
        revenue: {
            total: number;
            mrr: number;
            lifetime: number;
        };
        conversions: {
            trialToFree: string;
            trialToPro: string;
        };
    };
    recentActivity: Array<{
        event: string;
        stack: string | null;
        tier: string | null;
        timestamp: string;
    }>;
    topStacks: Array<{
        stack: string;
        count: number;
    }>;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/dashboard");

            if (res.status === 401) {
                router.push("/login");
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch dashboard");
            }

            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/admin-logout", { method: "POST" });
            router.push("/admin-login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboard}
                        className="px-4 py-2 bg-cyber-purple text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tech-black font-space">
            {/* Header */}
            <header className="border-b border-white/10 bg-tech-zinc/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1 border border-white/10 bg-black/50">
                            <Terminal className="w-5 h-5 text-tech-blue" />
                        </div>
                        <span className="text-lg font-bold uppercase tracking-tight text-white">
                            Kybernus <span className="text-tech-purple text-xs border border-tech-purple/30 px-1 py-0.5 ml-1">ADMIN</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchDashboard}
                            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-muted-foreground hover:text-white"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-white border border-transparent hover:border-white/10 transition-all"
                        >
                            <LogOut className="w-3 h-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        icon={Users}
                        label="Total Users"
                        value={data?.metrics.total.users || 0}
                        color="text-tech-blue"
                        borderColor="border-tech-blue/20"
                    />
                    <MetricCard
                        icon={Activity}
                        label="Trial Users"
                        value={data?.metrics.total.trial || 0}
                        subtext={`${data?.metrics.conversions.trialToFree}% → FREE`}
                        color="text-tech-warning"
                        borderColor="border-tech-warning/20"
                    />
                    <MetricCard
                        icon={TrendingUp}
                        label="FREE Tier"
                        value={data?.metrics.total.free || 0}
                        subtext={`$${data?.metrics.revenue.mrr} MRR`}
                        color="text-tech-success"
                        borderColor="border-tech-success/20"
                    />
                    <MetricCard
                        icon={DollarSign}
                        label="PRO Tier"
                        value={data?.metrics.total.pro || 0}
                        subtext={`$${data?.metrics.revenue.lifetime} lifetime`}
                        color="text-tech-purple"
                        borderColor="border-tech-purple/20"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-tech-zinc/30 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden"
                    >
                        {/* Tech Borders */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                        <h2 className="text-sm font-mono font-bold uppercase tracking-tight mb-6 flex items-center gap-2 text-white">
                            <Activity className="w-4 h-4 text-tech-blue" />
                            Recent Activity Log
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-white/10">
                                        <th className="text-left py-2 px-2">Event</th>
                                        <th className="text-left py-2 px-2">Stack</th>
                                        <th className="text-left py-2 px-2">Tier</th>
                                        <th className="text-left py-2 px-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-xs">
                                    {data?.recentActivity.slice(0, 10).map((event, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-2 px-2 text-white">{event.event}</td>
                                            <td className="py-2 px-2 text-muted-foreground">{event.stack || '-'}</td>
                                            <td className="py-2 px-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 border ${event.tier === 'PRO' ? 'border-tech-purple/50 text-tech-purple bg-tech-purple/10' :
                                                    event.tier === 'FREE' ? 'border-tech-success/50 text-tech-success bg-tech-success/10' :
                                                        'border-tech-warning/50 text-tech-warning bg-tech-warning/10'
                                                    }`}>
                                                    {event.tier || 'TRIAL'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-muted-foreground">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Top Stacks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-tech-zinc/30 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden"
                    >
                        {/* Tech Borders */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                        <h2 className="text-sm font-mono font-bold uppercase tracking-tight mb-6 flex items-center gap-2 text-white">
                            <BarChart3 className="w-4 h-4 text-tech-purple" />
                            Stack Usage Metrics
                        </h2>
                        <div className="space-y-4">
                            {data?.topStacks.map((stack, i) => {
                                const maxCount = data.topStacks[0]?.count || 1;
                                const percentage = (stack.count / maxCount) * 100;

                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-mono mb-1">
                                            <span className="font-bold text-white uppercase">{stack.stack}</span>
                                            <span className="text-muted-foreground">{stack.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 w-full flex">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                className="h-full bg-tech-purple"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    subtext,
    color,
    borderColor
}: {
    icon: any;
    label: string;
    value: number;
    subtext?: string;
    color: string;
    borderColor: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-tech-zinc/20 border border-white/10 p-6 hover:border-white/20 transition-all relative group overflow-hidden`}
        >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-${color.replace('text-', '')}/50 to-transparent opacity-50`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 border border-white/5 bg-black/30 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {subtext && (
                    <div className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 border border-white/5">
                        {subtext}
                    </div>
                )}
            </div>

            <div className="text-3xl font-space font-bold tracking-tighter mb-1 text-white">{value}</div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        </motion.div>
    );
}
