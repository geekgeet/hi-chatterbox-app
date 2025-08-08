import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SlideshowSection } from "@/components/slideshow-section"
import { ContentSection } from "@/components/content-section"
import { PriceCalculator } from "@/components/price-calculator"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import ProjectProgress from "@/components/project-progress"

const Index = () => {
  useEffect(() => {
    // تنظیم تم پیش‌فرض
    document.documentElement.classList.add("dark")
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="slideshow">
          <SlideshowSection />
        </section>
        
        <section id="content">
          <ContentSection />
        </section>
        
        <section id="progress">
          <ProjectProgress />
        </section>
        
        <section id="calculator">
          <PriceCalculator />
        </section>
        
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
