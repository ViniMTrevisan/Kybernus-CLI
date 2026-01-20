import { Twitter, Linkedin, Terminal, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-black py-20 overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyber-blue/20 to-transparent" />

            <div className="container px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 max-w-7xl mx-auto">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-6 h-6 text-cyber-blue" />
                            <span className="text-xl font-black uppercase tracking-tighter text-white">Kybernus</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            The ultimate CLI orchestrator for architects.
                            Built for speed, engineering excellence, and lifetime
                            scalability.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#stacks" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Tech Stacks</a></li>
                            <li><a href="#architecture" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Architectures</a></li>
                            <li><a href="#features" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Capabilities</a></li>
                            <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Developers */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Developers</h4>
                        <ul className="space-y-4">
                            <li><a href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Getting Started</a></li>
                            <li><a href="/docs/cli-reference" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">CLI Reference</a></li>
                            <li><a href="/docs" className="text-sm text-muted-foreground hover:text-cyber-blue transition-colors uppercase font-bold tracking-tighter">Documentation</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Connect</h4>
                        <div className="space-y-4">
                            <a href="mailto:contact@kybernus.com" className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-cyber-blue/10 transition-colors">
                                    <Mail className="w-4 h-4 text-muted-foreground group-hover:text-cyber-blue" />
                                </div>
                                <span className="text-sm text-muted-foreground group-hover:text-white transition-colors font-bold tracking-tighter">contact@kybernus.com</span>
                            </a>
                            <div className="p-6 rounded-2xl bg-cyber-blue/5 border border-cyber-blue/10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-cyber-blue mb-2">Pro Update</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Join 500+ architects on our monthly engineering newsletter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        © {new Date().getFullYear()} KYBERNUS ORCHESTRATOR. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</a>
                        <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
