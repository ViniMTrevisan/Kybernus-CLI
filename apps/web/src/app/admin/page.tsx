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

    const handleLogout = () => {
        document.cookie = "admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/admin-login-nao-acharao");
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-cyber-blue" />
                        <span className="text-xl font-black uppercase tracking-tighter">
                            Kybernus <span className="text-cyber-purple">Admin</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchDashboard}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
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
                        color="cyber-blue"
                    />
                    <MetricCard
                        icon={Activity}
                        label="Trial Users"
                        value={data?.metrics.total.trial || 0}
                        subtext={`${data?.metrics.conversions.trialToFree}% → FREE`}
                        color="yellow-500"
                    />
                    <MetricCard
                        icon={TrendingUp}
                        label="FREE Tier"
                        value={data?.metrics.total.free || 0}
                        subtext={`$${data?.metrics.revenue.mrr} MRR`}
                        color="neon-green"
                    />
                    <MetricCard
                        icon={DollarSign}
                        label="PRO Tier"
                        value={data?.metrics.total.pro || 0}
                        subtext={`$${data?.metrics.revenue.lifetime} lifetime`}
                        color="cyber-purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-dark border border-white/5 rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyber-blue" />
                            Recent Activity
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                                        <th className="text-left py-3">Event</th>
                                        <th className="text-left py-3">Stack</th>
                                        <th className="text-left py-3">Tier</th>
                                        <th className="text-left py-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.recentActivity.slice(0, 10).map((event, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-sm">{event.event}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{event.stack || '-'}</td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${event.tier === 'PRO' ? 'bg-cyber-purple/20 text-cyber-purple' :
                                                    event.tier === 'FREE' ? 'bg-neon-green/20 text-neon-green' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {event.tier || 'TRIAL'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
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
                        className="glass-dark border border-white/5 rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-cyber-purple" />
                            Top Stacks
                        </h2>
                        <div className="space-y-4">
                            {data?.topStacks.map((stack, i) => {
                                const maxCount = data.topStacks[0]?.count || 1;
                                const percentage = (stack.count / maxCount) * 100;

                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold">{stack.stack}</span>
                                            <span className="text-muted-foreground">{stack.count}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full"
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
    color
}: {
    icon: any;
    label: string;
    value: number;
    subtext?: string;
    color: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
        >
            <div className={`inline-flex p-3 rounded-xl bg-${color}/10 mb-4`}>
                <Icon className={`w-6 h-6 text-${color}`} />
            </div>
            <div className="text-3xl font-black tracking-tighter mb-1">{value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            {subtext && (
                <div className="text-sm text-muted-foreground mt-2">{subtext}</div>
            )}
        </motion.div>
    );
}
