"use client";

import { motion } from "framer-motion";
import { Quote, Users, Code, ExternalLink } from "lucide-react";

const testimonials = [
    {
        quote: "Kybernus reduced our initial project setup time from 2 days to 15 minutes. The Clean Architecture template is exactly what we needed.",
        author: "Alex Rivera",
        role: "Lead Architect @ TechScale",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
        quote: "Finally a CLI that doesn't just give you a 'Hello World'. The NestJS + Docker + Terraform setup is production-ready out of the box.",
        author: "Sarah Chen",
        role: "Senior Fullstack Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
        quote: "Hexagonal architecture is hard to get right manually. Kybernus automates the structure so my team can focus only on business logic.",
        author: "Marco Rossi",
        role: "CTO @ FintechFlow",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
    },
];

const stats = [
    { label: "Projects Scaffolded", value: "24k+", icon: Code },
    { label: "Developer Community", value: "10k+", icon: Users },
    { label: "Active Projects", value: "500+", icon: Code },
];

export function SocialProof() {
    return (
        <section id="community" className="py-24 relative overflow-hidden">
            <div className="container px-4">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto justify-items-center">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-dark p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center group hover:border-cyber-blue/30 transition-all"
                        >
                            <div className="p-3 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                                <stat.icon className="w-6 h-6 text-cyber-blue" />
                            </div>
                            <div className="text-4xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 mb-4">
                        <Quote className="w-3 h-3 text-neon-green" />
                        <span className="text-xs font-bold tracking-widest uppercase text-neon-green">Success Stories</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">
                        TRUSTED BY <span className="text-neon-green">ENGINEERS</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From solo founders to enterprise teams, Kybernus is the secret
                        weapon for shipping high-quality code.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto justify-items-center">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass-dark p-8 rounded-[32px] border border-white/5 flex flex-col justify-between hover:border-neon-green/20 transition-all"
                        >
                            <div>
                                <p className="text-lg text-white/90 leading-relaxed italic mb-8">
                                    "{t.quote}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                                <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-2xl border border-white/10" />
                                <div>
                                    <div className="font-bold text-white text-sm">{t.author}</div>
                                    <div className="text-xs text-muted-foreground uppercase font-black tracking-tighter">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Community Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-16 text-center"
                >
                    <a href="#" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors group">
                        Join the Discord Community <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
