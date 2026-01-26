import { Terminal, Shield, Lock, Eye, Database, Server } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Kybernus',
    description: 'Data collection and usage policies for the Kybernus platform.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-tech-black font-sans text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tech-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-4xl mx-auto px-4 py-24 relative z-10">
                {/* Header */}
                <div className="mb-16">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                        <div className="relative">
                            <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                        </div>
                        <span className="text-sm font-space font-bold uppercase tracking-tight">Kybernus_Legal</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-space font-bold uppercase tracking-tight mb-6">
                        Privacy <span className="text-tech-blue">Policy</span>
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest border-l-2 border-tech-blue pl-4">
                        <span>Last Updated: January 21, 2026</span>
                        <span>// Protocol: Secure Data Handling</span>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-tech-gray/20 border border-white/10 p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
                    {/* Tech Borders */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />

                    <div className="prose prose-invert prose-headings:font-space prose-headings:uppercase max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
                                <Shield className="w-5 h-5 text-tech-blue" />
                                1. Data Collection
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-4">
                                Kybernus collects minimal data necessary to operate our CLI and Platform services. We adhere to a "strict need-to-know" architecture regarding user data.
                            </p>
                            <ul className="space-y-4 font-mono text-sm text-muted-foreground list-none pl-0">
                                <li className="flex items-start gap-3 bg-black/30 p-4 border border-white/5">
                                    <Eye className="w-4 h-4 text-tech-blue mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="text-white block mb-1">Identity Data</strong>
                                        Email address and encrypted password hash. We do not store plain-text passwords.
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 bg-black/30 p-4 border border-white/5">
                                    <Database className="w-4 h-4 text-tech-blue mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="text-white block mb-1">Operational Data</strong>
                                        Project generation statistics, license key usage logs, and CLI download metrics.
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 bg-black/30 p-4 border border-white/5">
                                    <Server className="w-4 h-4 text-tech-blue mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="text-white block mb-1">Payment Data</strong>
                                        Processed securely via Stripe. We do not store full credit card numbers on our servers.
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
                                <Lock className="w-5 h-5 text-tech-purple" />
                                2. Usage Protocols
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-4">
                                Data is processed solely for the purpose of providing, maintaining, and improving the Kybernus services.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 border border-white/10 bg-white/5">
                                    <h3 className="text-sm font-bold text-white mb-2 uppercase">Service Provision</h3>
                                    <p className="text-xs font-mono text-muted-foreground">Validating license keys and authorizing CLI access.</p>
                                </div>
                                <div className="p-4 border border-white/10 bg-white/5">
                                    <h3 className="text-sm font-bold text-white mb-2 uppercase">Communication</h3>
                                    <p className="text-xs font-mono text-muted-foreground">Sending transactional emails (invoices, resets) and critical updates.</p>
                                </div>
                                <div className="p-4 border border-white/10 bg-white/5">
                                    <h3 className="text-sm font-bold text-white mb-2 uppercase">Security</h3>
                                    <p className="text-xs font-mono text-muted-foreground">Detecting and preventing unauthorized access or abuse.</p>
                                </div>
                                <div className="p-4 border border-white/10 bg-white/5">
                                    <h3 className="text-sm font-bold text-white mb-2 uppercase">Legal Compliance</h3>
                                    <p className="text-xs font-mono text-muted-foreground">Complying with applicable laws and regulations.</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
                                <Database className="w-5 h-5 text-tech-success" />
                                3. Data Storage & Retention
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                                All data is stored in secure, encrypted databases within the United States (AWS/Vercel). We retain user data for the duration of the account existence. Upon account deletion request, all personal identifiers are purged within 30 days, retaining only anonymized usage statistics for historical analysis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
                                4. Contact Vector
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-4">
                                For data privacy inquiries or deletion requests, initiate a secure channel:
                            </p>
                            <a href="mailto:contact@kybernus.com" className="inline-flex items-center gap-2 px-4 py-2 bg-tech-blue/10 border border-tech-blue/30 text-tech-blue font-mono text-xs uppercase hover:bg-tech-blue hover:text-black transition-all">
                                contact@kybernus.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
