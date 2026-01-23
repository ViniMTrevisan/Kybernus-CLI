import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { StackShowcase } from "@/components/StackShowcase";
import { ArchitectureVisual } from "@/components/ArchitectureVisual";
import { SocialProof } from "@/components/SocialProof";
import { FinalCTA } from "@/components/FinalCTA";
import { WhyKybernus } from "@/components/WhyKybernus";
import { ArchitectureShowcase } from "@/components/ArchitectureShowcase";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhyKybernus />
      <ArchitectureShowcase />
      <StackShowcase />
      <Features />
      <ArchitectureVisual />
      <Pricing />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </main>
  );
}
