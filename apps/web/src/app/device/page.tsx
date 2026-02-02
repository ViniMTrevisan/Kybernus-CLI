'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Terminal, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function DeviceContent() {
    const searchParams = useSearchParams();
    const [userCode, setUserCode] = useState('');
    const [status, setStatus] = useState<'input' | 'authenticating' | 'success' | 'error'>('input');
    const [message, setMessage] = useState('');
    const hasProcessed = useRef(false);

    // Check if we're returning from Google OAuth
    const googleAuthCode = searchParams.get('code');
    const googleState = searchParams.get('state');

    useEffect(() => {
        // Prevent double processing
        if (hasProcessed.current) return;

        const storedUserCode = sessionStorage.getItem('deviceUserCode');

        // If we have both Google code and stored user code, complete the flow
        if (googleAuthCode && googleState && storedUserCode) {
            hasProcessed.current = true;
            completeDeviceAuth(storedUserCode, googleAuthCode, googleState);
        }
    }, [googleAuthCode, googleState]);

    async function completeDeviceAuth(deviceCode: string, gCode: string, gState: string) {
        setStatus('authenticating');
        setMessage('Completing authentication...');

        try {
            const response = await fetch('/api/auth/device/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important for CSRF cookie
                body: JSON.stringify({
                    userCode: deviceCode,
                    googleCode: gCode,
                    state: gState, // Pass state for CSRF verification
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Clear stored code
            sessionStorage.removeItem('deviceUserCode');

            setStatus('success');
            setMessage(data.isNewUser
                ? 'Account created! Return to your terminal.'
                : 'Authentication complete! Return to your terminal.');

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Authentication failed');
            // Clear on error so user can try again
            sessionStorage.removeItem('deviceUserCode');
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedCode = userCode.trim().toUpperCase();

        if (!trimmedCode) {
            setMessage('Please enter the code from your terminal');
            return;
        }

        // Validate format before proceeding
        if (!/^[A-Z]{4}-?[0-9]{4}$/.test(trimmedCode.replace('-', ''))) {
            setMessage('Invalid code format. Expected: XXXX-0000');
            return;
        }

        // Normalize code to ensure dash is present
        const normalizedCode = trimmedCode.includes('-')
            ? trimmedCode
            : `${trimmedCode.slice(0, 4)}-${trimmedCode.slice(4)}`;

        // Store the user code for after Google OAuth
        sessionStorage.setItem('deviceUserCode', normalizedCode);

        // Redirect to Google OAuth
        try {
            const response = await fetch('/api/auth/google/url', {
                credentials: 'include', // Important for state cookie
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Failed to get OAuth URL');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to start authentication. Please try again.');
            sessionStorage.removeItem('deviceUserCode');
        }
    };

    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-purple/10 rounded-full blur-[150px] opacity-40" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                        <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                    </Link>
                    <h1 className="text-2xl font-space font-bold uppercase tracking-tight mb-2 text-white">
                        CLI <span className="text-tech-purple">Authentication</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs">
                        // Enter the code from your terminal
                    </p>
                </div>

                {status === 'input' && (
                    <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 relative">
                        {/* Tech Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                        <div className="flex items-center gap-3 mb-6 p-3 bg-black/30 border border-white/5">
                            <Terminal className="w-5 h-5 text-tech-blue" />
                            <code className="text-sm text-muted-foreground">kybernus login --google</code>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                                    {message}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                    Device Code
                                </label>
                                <input
                                    type="text"
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                                    placeholder="XXXX-0000"
                                    className="w-full px-4 py-4 bg-black/50 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-tech-purple/50 focus:ring-1 focus:ring-tech-purple/20 transition-all uppercase"
                                    maxLength={9}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-tech-purple text-white font-mono font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                <Smartphone className="w-4 h-4" />
                                Continue with Google
                            </button>
                        </form>
                    </div>
                )}

                {status === 'authenticating' && (
                    <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 text-center">
                        <Loader2 className="w-12 h-12 text-tech-purple animate-spin mx-auto mb-4" />
                        <p className="text-white font-mono">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-mono text-white mb-2">Success!</h2>
                        <p className="text-muted-foreground font-mono text-sm mb-6">{message}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                            You can close this window now.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-tech-gray/20 backdrop-blur-xl border border-white/10 p-8 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-mono text-white mb-2">Error</h2>
                        <p className="text-red-400 font-mono text-sm mb-6">{message}</p>
                        <button
                            onClick={() => {
                                setStatus('input');
                                setMessage('');
                                setUserCode('');
                            }}
                            className="px-6 py-3 bg-tech-purple text-white font-mono font-bold uppercase text-xs hover:bg-white hover:text-black transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function DevicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-tech-black flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-tech-purple animate-spin" />
            </div>
        }>
            <DeviceContent />
        </Suspense>
    );
}
