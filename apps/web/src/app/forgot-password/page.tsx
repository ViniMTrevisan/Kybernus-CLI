'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error('Something went wrong');

            setSubmitted(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-blue/10 rounded-full blur-[150px] opacity-40" />

            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center">
                    <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8 font-mono text-xs uppercase tracking-widest group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                    <h1 className="text-3xl font-space font-bold uppercase tracking-tight mb-2 text-white">
                        Reset <span className="text-tech-blue">Password</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs">
                        // Enter your email to begin recovery
                    </p>
                </div>

                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 relative overflow-hidden group">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                    {submitted ? (
                        <div className="text-center py-4 relative z-10">
                            <div className="w-16 h-16 bg-tech-success/10 rounded-none flex items-center justify-center mx-auto mb-6 border border-tech-success/20 relative">
                                <div className="absolute inset-0 border border-tech-success/20 scale-75" />
                                <Mail className="w-8 h-8 text-tech-success" />
                            </div>
                            <h3 className="text-xl font-space font-bold text-white mb-2 uppercase">Execution Successful</h3>
                            <p className="text-muted-foreground font-mono text-xs mb-8 leading-relaxed">
                                We've transmitted a password reset link to: <br />
                                <span className="text-tech-success">{email}</span>
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex w-full justify-center items-center py-3 px-4 bg-white/5 hover:bg-white/10 text-white transition-all font-mono font-bold uppercase text-xs tracking-widest border border-white/10 hover:border-white/20"
                            >
                                Return to Authenticate
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs flex items-center gap-2">
                                    <span className="font-bold">ERROR:</span> {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                    Email Address
                                </label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-tech-blue transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:border-tech-blue/50 focus:ring-1 focus:ring-tech-blue/20 transition-all"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-tech-blue text-black font-mono font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Transmitting...
                                    </>
                                ) : (
                                    'Initialize Reset'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
