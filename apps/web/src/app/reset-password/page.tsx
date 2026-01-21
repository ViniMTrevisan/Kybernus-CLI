'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Loader2, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('PASSWORDS_DO_NOT_MATCH');
            return;
        }

        if (password.length < 6) {
            setError('PASSWORD_TOO_SHORT_MIN_6_CHARS');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'FAILED_TO_RESET_PASSWORD');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-6 border border-tech-error/30 bg-tech-error/10 text-tech-error font-mono">
                <span className="font-bold">ERROR:</span> MISSING_RESET_TOKEN
                <br />
                <span className="text-xs opacity-70">Please request a new link via /forgot-password</span>
            </div>
        );
    }

    return success ? (
        <div className="text-center py-8">
            <div className="relative inline-block mx-auto mb-6">
                <div className="absolute inset-0 bg-tech-success/20 blur-xl rounded-full" />
                <div className="relative w-20 h-20 bg-tech-success/10 border border-tech-success/30 flex items-center justify-center">
                    <div className="absolute inset-0 border border-tech-success/20 scale-110" />
                    <ShieldCheck className="w-10 h-10 text-tech-success" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 font-space tracking-tight">PASSWORD RESET COMPLETE</h3>
            <p className="text-muted-foreground mb-8 font-mono text-xs">
                Credentials successfully updated in secure storage.<br />
                Redirecting to authentication portal...
            </p>
            <Link
                href="/login"
                className="inline-flex px-8 py-3 bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
            >
                Proceed to Login
            </Link>
        </div>
    ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-tech-error/10 border border-tech-error/30 text-tech-error text-xs font-mono">
                    <span className="font-bold">ERROR:</span> {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Password Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        New Password
                    </label>
                    <div className="relative group">
                        <Lock className={`absolute left-3 top-3.5 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-tech-purple' : 'text-muted-foreground'}`} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            minLength={6}
                            className="w-full bg-black/50 border border-white/10 text-white font-mono text-sm py-3 pl-10 pr-4 placeholder:text-muted-foreground/50 focus:outline-none focus:border-tech-purple/50 focus:ring-1 focus:ring-tech-purple/20 transition-all rounded-none"
                            placeholder="INPUT_NEW_CREDENTIALS"
                        />
                        {/* Corner accents */}
                        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${focusedField === 'password' ? 'border-tech-purple' : 'border-transparent'}`} />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${focusedField === 'password' ? 'border-tech-purple' : 'border-transparent'}`} />
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        Confirm Password
                    </label>
                    <div className="relative group">
                        <Lock className={`absolute left-3 top-3.5 w-4 h-4 transition-colors duration-300 ${focusedField === 'confirm' ? 'text-tech-purple' : 'text-muted-foreground'}`} />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField('confirm')}
                            onBlur={() => setFocusedField(null)}
                            required
                            minLength={6}
                            className="w-full bg-black/50 border border-white/10 text-white font-mono text-sm py-3 pl-10 pr-4 placeholder:text-muted-foreground/50 focus:outline-none focus:border-tech-purple/50 focus:ring-1 focus:ring-tech-purple/20 transition-all rounded-none"
                            placeholder="CONFIRM_CREDENTIALS"
                        />
                        {/* Corner accents */}
                        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${focusedField === 'confirm' ? 'border-tech-purple' : 'border-transparent'}`} />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${focusedField === 'confirm' ? 'border-tech-purple' : 'border-transparent'}`} />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-xs py-4 hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            UPDATING...
                        </>
                    ) : (
                        'UPDATE_CREDENTIALS >>'
                    )}
                </span>
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-tech-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-tech-purple/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center">
                    <Link href="/login" className="group inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8 font-mono text-xs uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="flex justify-center mb-6">
                        <div className="p-3 border border-white/10 bg-black/50 backdrop-blur-sm relative">
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/30" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white/30" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white/30" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/30" />
                            <Terminal className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 font-space tracking-tight">
                        <span className="text-tech-purple">Secure</span> Reset
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs">
                        // Establish new security credentials
                    </p>
                </div>

                <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative">
                    {/* Tech Borders for Card */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white/50" />
                    <div className="absolute top-0 right-0 w-1 h-1 bg-white/50" />
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/50" />
                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/50" />

                    <Suspense fallback={<div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-tech-purple" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
