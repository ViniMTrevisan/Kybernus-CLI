'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'linking' | 'error'>('processing');
    const [message, setMessage] = useState('Completing authentication...');
    const [linkingData, setLinkingData] = useState<{ email: string; code: string; state: string } | null>(null);
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double processing in React StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage('Authentication was cancelled or failed');
            return;
        }

        if (!code) {
            setStatus('error');
            setMessage('No authorization code received');
            return;
        }

        // Exchange code for token
        exchangeCode(code, state);
    }, [searchParams]);

    const exchangeCode = async (code: string, state: string | null) => {
        try {
            const response = await fetch('/api/auth/google/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, state }),
                credentials: 'include', // Important for cookies
            });

            const data = await response.json();

            if (data.needsLinking) {
                setStatus('linking');
                setMessage(data.message);
                // Store code and state for secure linking (NOT googleId)
                setLinkingData({
                    email: data.email,
                    code: code,
                    state: state || '',
                });
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            setStatus('success');
            setMessage(data.isNewUser ? 'Account created successfully!' : 'Welcome back!');

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Authentication failed');
        }
    };

    const handleLinkAccount = async () => {
        if (!linkingData) return;

        setStatus('processing');
        setMessage('Linking your accounts...');

        try {
            // First get a fresh OAuth URL to get a new state token
            const urlResponse = await fetch('/api/auth/google/url', {
                credentials: 'include',
            });
            const urlData = await urlResponse.json();

            // Redirect to Google to re-authenticate for linking
            // This ensures the user proves they own the Google account
            window.location.href = urlData.url + '&prompt=consent';

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to link accounts');
        }
    };

    return (
        <div className="min-h-screen bg-tech-black flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 text-tech-blue animate-spin mx-auto mb-6" />
                        <h1 className="text-xl font-mono text-white mb-2">{message}</h1>
                        <p className="text-sm text-muted-foreground font-mono">Please wait...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-xl font-mono text-white mb-2">{message}</h1>
                        <p className="text-sm text-muted-foreground font-mono">Redirecting to dashboard...</p>
                    </>
                )}

                {status === 'linking' && (
                    <div className="max-w-md">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                        <h1 className="text-xl font-mono text-white mb-4">Account Already Exists</h1>
                        <p className="text-sm text-muted-foreground font-mono mb-2">
                            An account with <strong className="text-white">{linkingData?.email}</strong> already exists.
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mb-6">
                            To link your Google account, you'll need to sign in again with Google.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleLinkAccount}
                                className="px-6 py-3 bg-tech-blue text-black font-mono font-bold uppercase text-xs hover:bg-white transition-all"
                            >
                                Link with Google
                            </button>
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-white/10 text-white font-mono font-bold uppercase text-xs hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-xl font-mono text-white mb-2">Authentication Failed</h1>
                        <p className="text-sm text-red-400 font-mono mb-6">{message}</p>
                        <Link
                            href="/login"
                            className="inline-block px-6 py-3 bg-tech-blue text-black font-mono font-bold uppercase text-xs hover:bg-white transition-all"
                        >
                            Try Again
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-tech-black flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-tech-blue animate-spin" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
