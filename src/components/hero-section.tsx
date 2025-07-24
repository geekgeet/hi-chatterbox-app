import { Button } from "@/components/ui/button"
import { ArrowDown, Zap, Sun } from "lucide-react"
import heroImage from "@/assets/solar-hero.jpg"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* پس‌زمینه ویدیویی */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>
      
      {/* افکت‌های انرژی */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-solar opacity-20 animate-energy-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-primary/30 animate-solar-glow"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-40 bg-gradient-to-b from-primary to-secondary opacity-40 animate-electric-flow"></div>
      </div>

      {/* محتوای اصلی */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Sun className="w-16 h-16 text-primary animate-solar-glow ml-4" />
          <Zap className="w-12 h-12 text-secondary animate-energy-pulse" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-solar bg-clip-text text-transparent animate-solar-glow">
          خورشید زرین کیان
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/90 mb-8 leading-relaxed">
          آینده انرژی پاک و تجدیدپذیر
          <br />
          تولید برق خورشیدی با جدیدترین تکنولوژی‌های دنیا
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-solar hover:scale-105 transition-all duration-300 animate-energy-pulse text-lg px-8 py-4"
          >
            محاسبه قیمت برق
            <Zap className="mr-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary/50 text-foreground hover:border-primary hover:bg-primary/10 text-lg px-8 py-4"
          >
            درباره نیروگاه
          </Button>
        </div>
      </div>

      {/* نشانگر اسکرول */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-8 h-8 text-primary animate-energy-pulse" />
      </div>
    </section>
  )
}