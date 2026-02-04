import { Twitter, Linkedin, Terminal } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-tech-black py-20 overflow-hidden">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="container max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image src="/kybernus-new.png" alt="Kybernus Logo" width={80} height={80} className="object-contain" />
                            </div>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground leading-relaxed max-w-xs">
                            // SYSTEM_STATUS: OPERATIONAL<br />
                            Powering the next generation of scalable backend architectures.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-white/10 text-muted-foreground hover:text-white hover:border-tech-blue hover:bg-tech-blue/10 transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 border border-white/10 text-muted-foreground hover:text-white hover:border-tech-blue hover:bg-tech-blue/10 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <span className="w-2 h-2 bg-tech-blue" />
                            Product
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="#stacks" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">Tech Stacks</a></li>
                            <li><a href="#architecture" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">Architectures</a></li>
                            <li><a href="#features" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">Features</a></li>
                        </ul>
                    </div>

                    {/* Developers */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <span className="w-2 h-2 bg-tech-purple" />
                            Developers
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">Getting Started</a></li>
                            <li><a href="/docs/cli-reference" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">CLI Reference</a></li>
                            <li><a href="/docs" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-tech-blue transition-colors">API Status</a></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <span className="w-2 h-2 bg-tech-success" />
                            Connect
                        </h4>
                        <div className="space-y-4">
                            <a
                                href="https://discord.gg/M2GyVqX2hg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-tech-gray border border-white/5 relative overflow-hidden group hover:border-tech-purple/30 transition-all"
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-tech-purple/10 blur-2xl group-hover:bg-tech-purple/20 transition-all" />
                                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-tech-purple mb-2">COMMUNITY</div>
                                <p className="text-xs text-muted-foreground mb-3 group-hover:text-white transition-colors">
                                    Join us on Discord.
                                </p>
                                <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                                    Join Server →
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            © {new Date().getFullYear()} KYBERNUS INC. // SYSTEM ID: KIB-9000
                        </p>
                        <span className="hidden md:inline text-[10px] text-white/10">|</span>
                        <a
                            href="https://www.solutionsbynex.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-muted-foreground hover:text-tech-blue uppercase tracking-wider transition-colors"
                        >
                            Developed by Nex Solutions
                        </a>
                    </div>
                    <div className="flex gap-8">
                        <a href="/privacy" className="text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Privacy Policy</a>
                        <a href="/terms" className="text-[10px] font-mono text-muted-foreground hover:text-white uppercase tracking-wider transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
