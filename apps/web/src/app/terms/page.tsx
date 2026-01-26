import { Terminal, Gavel, Scale, AlertTriangle, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | Kybernus',
    description: 'Terms and conditions for using the Kybernus platform and CLI.',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-tech-black font-sans text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tech-purple/5 rounded-full blur-[120px] pointer-events-none" />

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
                        Terms of <span className="text-tech-purple">Service</span>
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest border-l-2 border-tech-purple pl-4">
                        <span>Last Updated: January 21, 2026</span>
                        <span>// Protocol: Terms of Engagement</span>
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
                            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
                                <FileText className="w-5 h-5 text-tech-purple" />
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                                By accessing or using the Kybernus CLI, Website, or Services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must unauthorized access immediately and uninstall the CLI.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
                                <Scale className="w-5 h-5 text-tech-purple" />
                                2. License & Access
                            </h2>
                            <div className="space-y-4 font-mono text-sm text-muted-foreground">
                                <p>
                                    <strong>Free Tier (Kybernus Architect):</strong> Limited personal use license. Attribution required.
                                </p>
                                <p>
                                    <strong>Kybernus Pro:</strong> Commercial license for individual developers. Allows use in commercial projects.
                                </p>
                                <p>
                                    <strong>Enterprise (coming soon):</strong> Custom license agreement for organizations.
                                </p>
                                <div className="p-4 bg-tech-purple/5 border border-tech-purple/20 text-xs mt-4">
                                    Prohibition: You may not resell, redistribute, or reverse engineer the Kybernus CLI source code or generated templates in their raw form as a competing product.
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
                                <AlertTriangle className="w-5 h-5 text-tech-warning" />
                                3. Disclaimer of Warranties
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                                The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express or implied. Kybernus does not guarantee that generated code is bug-free or suitable for critical infrastructure without review. You are responsible for the code you deploy.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
                                <Gavel className="w-5 h-5 text-white" />
                                4. Termination
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                                We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms (e.g., license key sharing).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
                                5. Governing Law
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-4">
                                These Terms shall be governed by the laws of Brazil/International Commerce Laws, without regard to its conflict of law provisions.
                            </p>
                            <a href="mailto:contact@kybernus.com" className="inline-flex items-center gap-2 px-4 py-2 bg-tech-purple/10 border border-tech-purple/30 text-tech-purple font-mono text-xs uppercase hover:bg-tech-purple hover:text-white transition-all">
                                contact@kybernus.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
