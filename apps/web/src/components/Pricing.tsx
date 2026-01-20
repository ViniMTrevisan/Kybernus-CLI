"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, X, Sparkles, ShieldCheck, Zap, CreditCard, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Architect",
        price: "$7",
        period: "/month",
        description: "Ideal for individual developers and rapid prototyping.",
        tier: "free" as const,
        features: [
            { text: "Standard Node.js Templates", included: true },
            { text: "Java Spring Boot Core", included: true },
            { text: "Next.js Frontend Scaffolding", included: true },
            { text: "MVC Architecture Patterns", included: true },
            { text: "Basic Docker Configs", included: true },
            { text: "Advanced NestJS Patterns", included: false },
            { text: "Clean & Hexagonal Models", included: false },
            { text: "Full CI/CD Pipelines", included: false },
            { text: "AI-Powered API Docs", included: false },
        ],
        cta: "Start Building Free",
        highlighted: false,
        color: "cyber-blue",
    },
    {
        name: "Kybernus Pro",
        price: "$97",
        period: "lifetime",
        description: "The ultimate weapon for enterprise-grade engineering.",
        tier: "pro" as const,
        features: [
            { text: "Everything in Architect tier", included: true },
            { text: "NestJS & Python FastAPI Pro", included: true },
            { text: "Clean & Hexagonal Architecture", included: true },
            { text: "Production-ready Docker", included: true },
            { text: "Full CI/CD Pipelines (Multi-env)", included: true },
            { text: "Terraform IaC Configurations", included: true },
            { text: "AI Documentation Generator", included: true },
            { text: "Priority Enterprise Support", included: true },
            { text: "Lifetime Updates & New Stacks", included: true },
        ],
        cta: "Unlock Pro Access",
        highlighted: true,
        color: "cyber-purple",
    },
];

function PricingCard({ tier, index }: { tier: any, index: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (tier.tier === 'free') {
            // Free tier goes to docs
            window.location.href = '/docs/getting_started';
            return;
        }

        // Pro tier creates checkout session
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tier.tier }),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative p-8 rounded-3xl border transition-all duration-300",
                tier.highlighted
                    ? "glass-dark border-cyber-purple/50 shadow-[0_0_50px_rgba(176,38,255,0.15)] ring-1 ring-cyber-purple/20"
                    : "glass-dark border-white/10"
            )}
        >
            {tier.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-pink text-white text-xs font-black tracking-tighter uppercase shadow-lg shadow-cyber-purple/20">
                        <Sparkles className="w-3 h-3" /> Recommended for Teams
                    </div>
                </div>
            )}

            <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                <div className="mb-8">
                    <h3 className={cn(
                        "text-2xl font-black mb-2 uppercase tracking-tight",
                        tier.highlighted ? "text-cyber-purple" : "text-white"
                    )}>{tier.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                        <span className="text-muted-foreground font-mono uppercase text-xs">{tier.period}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tier.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                    {tier.features.map((feature: any, fIndex: number) => (
                        <div key={fIndex} className="flex items-start gap-3 group/feat">
                            <div className={cn(
                                "mt-1 p-0.5 rounded-full",
                                feature.included ? "bg-neon-green/10" : "bg-white/5"
                            )}>
                                {feature.included ? (
                                    <Check className="w-3.5 h-3.5 text-neon-green" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                                )}
                            </div>
                            <span className={cn(
                                "text-sm",
                                feature.included ? "text-white/80 group-hover/feat:text-white" : "text-muted-foreground/40"
                            )}>
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleClick}
                    disabled={loading}
                    className={cn(
                        "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-50",
                        tier.highlighted
                            ? "bg-white text-black hover:bg-cyber-purple hover:text-white shadow-xl shadow-cyber-purple/10"
                            : "bg-secondary text-white hover:bg-white/10 border border-white/5"
                    )}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : tier.cta}
                </button>
            </div>

            {/* Decorative Glow */}
            <div className={cn(
                "absolute -bottom-10 -right-10 w-40 h-40 blur-[100px] opacity-20 pointer-events-none",
                tier.highlighted ? "bg-cyber-purple" : "bg-cyber-blue"
            )} />
        </motion.div>
    );
}

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-4">
                        <CreditCard className="w-3 h-3 text-cyber-purple" />
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Investment</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        ACCELERATE YOUR <span className="text-cyber-purple">WORKFLOW</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your engineering needs. Start for free, upgrade for full power.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto perspective-2000 justify-items-center">
                    {tiers.map((tier, index) => (
                        <PricingCard key={index} tier={tier} index={index} />
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-tighter">Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-tighter">Instant Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-tighter">Lifetime Updates</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
