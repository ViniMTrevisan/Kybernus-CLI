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
import { ArchitectureExplorer } from "@/components/ArchitectureExplorer";

// Force static generation for homepage to reduce edge requests
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhyKybernus />
      <ArchitectureExplorer />
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
