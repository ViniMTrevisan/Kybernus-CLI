'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if already logged in
        fetch('/api/user/me')
            .then((res) => {
                if (res.ok) router.push('/dashboard');
            })
            .catch(() => {
                // Not logged in, stay on page
            });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-blue/10 rounded-full blur-[150px] opacity-40" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                        <div className="relative">
                            <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-space font-bold uppercase tracking-tight mb-2 text-white">
                        Welcome <span className="text-tech-blue">Back</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs">
                        // Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 relative overflow-hidden group">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Email
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-tech-blue transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:border-tech-blue/50 focus:ring-1 focus:ring-tech-blue/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[10px] font-mono text-tech-blue hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-tech-blue transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:border-tech-blue/50 focus:ring-1 focus:ring-tech-blue/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-tech-blue text-black font-mono font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Authenticate
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* OAuth Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-tech-gray/20 px-3 text-muted-foreground font-mono">Or</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <GoogleSignInButton mode="signin" />

                    <div className="mt-6 pt-6 border-t border-white/5 text-center flex flex-col gap-2">
                        <span className="text-xs font-mono text-muted-foreground">Need access?</span>
                        <Link href="/register" className="text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-tech-blue transition-colors inline-block">
                            // REQUEST ACCESS
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
