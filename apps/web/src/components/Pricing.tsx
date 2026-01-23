"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, X, Sparkles, ShieldCheck, Zap, CreditCard, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Kybernus Architect",
        price: "$9",
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
        cta: "Get Architect",
        secondaryCta: "Start Building Free",
        secondaryLink: "/register",
        highlighted: false,
        accent: "tech-blue",
    },
    {
        name: "Kybernus Pro",
        price: "$49",
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
        accent: "tech-purple",
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-32 relative overflow-hidden bg-tech-black font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-tech-blue/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tech-purple/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-gray border border-white/10 mb-6">
                        <CreditCard className="w-3 h-3 text-tech-blue" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-tech-blue">Investment</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-space font-bold mb-6 tracking-tight text-white">
                        ACCELERATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-blue to-tech-purple">WORKFLOW</span>
                    </h2>
                    <p className="text-xl font-mono text-muted-foreground max-w-2xl mx-auto">
                        // Choose the plan that fits your engineering needs. <br />
                        <span className="text-tech-success">Be a PRO. Own it forever.</span> No subscriptions, no surprises.
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
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-12"
                >
                    <div className="flex flex-col items-center gap-2 text-center group">
                        <div className="p-3 bg-tech-blue/10 rounded-none border border-tech-blue/30 group-hover:border-tech-blue/60 transition-colors">
                            <ShieldCheck className="w-6 h-6 text-tech-blue" />
                        </div>
                        <span className="text-sm font-space font-bold uppercase tracking-wider text-white mt-2">Secure Checkout</span>
                        <span className="text-xs font-mono text-muted-foreground">256-bit Encrypted</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center group">
                        <div className="p-3 bg-tech-purple/10 rounded-none border border-tech-purple/30 group-hover:border-tech-purple/60 transition-colors">
                            <Zap className="w-6 h-6 text-tech-purple" />
                        </div>
                        <span className="text-sm font-space font-bold uppercase tracking-wider text-white mt-2">Instant Delivery</span>
                        <span className="text-xs font-mono text-muted-foreground">License Key via Email</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center group">
                        <div className="p-3 bg-tech-success/10 rounded-none border border-tech-success/30 group-hover:border-tech-success/60 transition-colors">
                            <Clock className="w-6 h-6 text-tech-success" />
                        </div>
                        <span className="text-sm font-space font-bold uppercase tracking-wider text-white mt-2">Lifetime Updates</span>
                        <span className="text-xs font-mono text-muted-foreground">One-time payment</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function PricingCard({ tier, index }: { tier: any, index: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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

    const isPro = tier.accent === "tech-purple";
    const accentColor = isPro ? "text-tech-purple" : "text-tech-blue";
    const accentBg = isPro ? "bg-tech-purple" : "bg-tech-blue";
    const accentBorder = isPro ? "border-tech-purple" : "border-tech-blue";

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
                "relative group w-full max-w-md",
            )}
        >
            <div className={cn(
                "relative h-full p-8 bg-tech-gray/40 backdrop-blur-md border border-white/10 transition-all duration-300 overflow-hidden",
                tier.highlighted && `border-tech-purple/50 shadow-[0_0_50px_rgba(147,51,234,0.15)]`
            )}>
                {/* Tech Borders */}
                <div className={cn("absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 transition-colors group-hover:border-opacity-100", isPro ? "group-hover:border-tech-purple" : "group-hover:border-tech-blue")} />
                <div className={cn("absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 transition-colors group-hover:border-opacity-100", isPro ? "group-hover:border-tech-purple" : "group-hover:border-tech-blue")} />
                <div className={cn("absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 transition-colors group-hover:border-opacity-100", isPro ? "group-hover:border-tech-purple" : "group-hover:border-tech-blue")} />
                <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 transition-colors group-hover:border-opacity-100", isPro ? "group-hover:border-tech-purple" : "group-hover:border-tech-blue")} />

                {tier.highlighted && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-tech-blue via-tech-purple to-tech-blue" />
                )}

                <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
                    <div className="mb-8 border-b border-white/5 pb-8">
                        {tier.highlighted && (
                            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-tech-purple/10 border border-tech-purple/30">
                                <Sparkles className="w-3 h-3 text-tech-purple" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-tech-purple">Recommended</span>
                            </div>
                        )}
                        <h3 className="text-3xl font-space font-bold mb-2 text-white tracking-tight uppercase">{tier.name}</h3>
                        <p className="text-sm font-mono text-muted-foreground mb-6 h-10">{tier.description}</p>

                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-mono font-bold text-white tracking-tighter">{tier.price}</span>
                            <span className="text-muted-foreground font-mono uppercase text-xs">{tier.period}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        {tier.features.map((feature: any, fIndex: number) => (
                            <div key={fIndex} className="flex items-center gap-3 group/feat">
                                <div className={cn(
                                    "flex-shrink-0 w-5 h-5 flex items-center justify-center border",
                                    feature.included
                                        ? cn("bg-opacity-10", isPro ? "border-tech-purple/50 bg-tech-purple/10" : "border-tech-blue/50 bg-tech-blue/10")
                                        : "border-white/10 bg-transparent"
                                )}>
                                    {feature.included ? (
                                        <Check className={cn("w-3 h-3", isPro ? "text-tech-purple" : "text-tech-blue")} />
                                    ) : (
                                        <X className="w-3 h-3 text-muted-foreground/30" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm font-mono",
                                    feature.included ? "text-white/90" : "text-muted-foreground/40 line-through"
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
                            "w-full py-4 font-mono font-bold uppercase tracking-widest text-xs transition-all border group relative overflow-hidden flex items-center justify-center gap-2",
                            tier.highlighted
                                ? `bg-tech-purple text-white border-tech-purple hover:bg-white hover:text-black hover:border-white`
                                : "bg-transparent text-white border-white/20 hover:border-white hover:bg-white/5"
                        )}
                    >
                        {loading ? (
                            "PROCESSING..."
                        ) : (
                            <>
                                {tier.cta}
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {tier.secondaryCta && (
                        <a
                            href={tier.secondaryLink}
                            className="w-full mt-3 py-3 block text-center font-mono font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
                        >
                            {tier.secondaryCta}
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
