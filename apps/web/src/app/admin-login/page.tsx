"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            // Redirect to admin dashboard
            router.push("/admin");
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-tech-purple/10 via-transparent to-tech-blue/5 pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tech-purple/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 border border-white/10 bg-black/50 backdrop-blur-sm relative group">
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/30 group-hover:border-tech-purple transition-colors" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white/30 group-hover:border-tech-purple transition-colors" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white/30 group-hover:border-tech-purple transition-colors" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/30 group-hover:border-tech-purple transition-colors" />
                            <ShieldAlert className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold font-space uppercase tracking-tight mb-2 text-white">
                        Admin <span className="text-tech-purple">Portal</span>
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-purple/10 border border-tech-purple/30 rounded-full">
                        <div className="w-1.5 h-1.5 bg-tech-purple animate-pulse rounded-full" />
                        <span className="text-[10px] font-mono font-bold text-tech-purple uppercase tracking-widest">
                            Restricted Access
                        </span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-tech-error/10 border border-tech-error/30 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-tech-error mt-0.5 shrink-0" />
                                <div className="text-xs font-mono text-tech-error">
                                    <span className="font-bold">ACCESS DENIED:</span> {error}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Identifier
                            </label>
                            <div className="relative group">
                                <Mail className={`absolute left-3 top-3.5 w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-tech-purple' : 'text-muted-foreground'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="admin@kybernus.dev"
                                    className="w-full bg-black/50 border border-white/10 text-white font-mono text-sm py-3 pl-10 pr-4 placeholder:text-muted-foreground/50 focus:outline-none focus:border-tech-purple/50 focus:ring-1 focus:ring-tech-purple/20 transition-all rounded-none"
                                    required
                                />
                                {/* Corner accents */}
                                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${focusedField === 'email' ? 'border-tech-purple' : 'border-transparent'}`} />
                                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${focusedField === 'email' ? 'border-tech-purple' : 'border-transparent'}`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Security Key
                            </label>
                            <div className="relative group">
                                <Lock className={`absolute left-3 top-3.5 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-tech-purple' : 'text-muted-foreground'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-white/10 text-white font-mono text-sm py-3 pl-10 pr-4 placeholder:text-muted-foreground/50 focus:outline-none focus:border-tech-purple/50 focus:ring-1 focus:ring-tech-purple/20 transition-all rounded-none"
                                    required
                                />
                                {/* Corner accents */}
                                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${focusedField === 'password' ? 'border-tech-purple' : 'border-transparent'}`} />
                                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${focusedField === 'password' ? 'border-tech-purple' : 'border-transparent'}`} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-2"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    <>
                                        ESTABLISH UPLINK
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-8 font-mono">
                    Kybernus System v2.0 // Authorized Use Only
                </p>
            </div>
        </div>
    );
}
