'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Lock, Mail, Save, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface User {
    email: string;
}

interface ProfileClientProps {
    user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Email State
    const [email, setEmail] = useState(user.email);
    const [newEmail, setNewEmail] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/update-email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, newEmail }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Force logout on email change
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login?message=Email updated. Please login again.');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords don't match" });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/user/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tech-black font-sans text-white p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tech-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-4xl mx-auto relative z-10">
                <div className="mb-12">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-white mb-6 uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Command Center
                    </Link>
                    <h1 className="text-3xl font-space font-bold uppercase tracking-tight flex items-center gap-3">
                        <div className="relative">
                            <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                        </div>
                        Profile <span className="text-tech-blue">Config</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Update Email */}
                    <div className="bg-tech-gray/20 border border-white/10 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />

                        <h2 className="text-sm font-space font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-tech-blue" />
                            Update Communication Channel
                        </h2>

                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Current Email</label>
                                <input type="email" value={email} disabled className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-muted-foreground cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1 block">New Email</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-white focus:border-tech-blue outline-none transition-colors"
                                    placeholder="new.operator@kybernus.io"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-tech-blue hover:text-black hover:border-tech-blue text-xs font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update & Re-authenticate'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Update Password */}
                    <div className="bg-tech-gray/20 border border-white/10 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />

                        <h2 className="text-sm font-space font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-tech-purple" />
                            Security Credentials
                        </h2>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-white focus:border-tech-purple outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-white focus:border-tech-purple outline-none transition-colors"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs font-mono text-white focus:border-tech-purple outline-none transition-colors"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-tech-purple hover:text-white hover:border-tech-purple text-xs font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Security Settings</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 border flex items-center gap-3 text-xs font-mono ${message.type === 'success'
                            ? 'bg-tech-success/10 border-tech-success/20 text-tech-success'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        {message.text}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
