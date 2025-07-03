import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import About from "@/components/about";
import Features from "@/components/features";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Features />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
