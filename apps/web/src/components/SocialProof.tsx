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

// const stats = [
//     { label: "Projects Scaffolded", value: "2k+", icon: Code },
//     { label: "Developer Community", value: "400+", icon: Users },
//     { label: "Active Projects", value: "1k+", icon: Code },
// ];

export function SocialProof() {
    return (
        <section id="community" className="py-32 relative overflow-hidden bg-tech-black">
            <div className="container px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6">
                        <Quote className="w-3 h-3 text-tech-green" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-green">Success Stories</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tight mb-6 uppercase text-white">
                        TRUSTED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-green to-tech-blue">ENGINEERS</span>
                    </h2>
                    <p className="text-xl font-mono text-muted-foreground max-w-2xl mx-auto">
                        // From solo founders to enterprise teams, Kybernus is the secret <br />
                        weapon for shipping high-quality code.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-tech-gray/10 backdrop-blur-sm p-8 border border-white/5 flex flex-col justify-between hover:border-tech-green/30 transition-all relative group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-tech-green/40 transition-colors" />

                            <div>
                                <p className="text-lg font-mono text-white/80 leading-relaxed italic mb-8">
                                    "{t.quote}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                                <img src={t.avatar} alt={t.author} className="w-10 h-10 border border-white/10 grayscale group-hover:grayscale-0 transition-all" />
                                <div>
                                    <div className="font-bold text-white text-sm font-space">{t.author}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Community Link */}
                {/* <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center"
                >
                    <a href="#" className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors group border-b border-transparent hover:border-white pb-1">
                        Join the Discord Community <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div> */}
            </div>
        </section>
    );
}
