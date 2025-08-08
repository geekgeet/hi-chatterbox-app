import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import solarPanels1 from "@/assets/solar-panels-1.jpg"
import controlRoom from "@/assets/control-room.jpg"
import solarFarmAerial from "@/assets/solar-farm-aerial.jpg"

const slides = [
  {
    image: solarPanels1,
    title: "پنل‌های خورشیدی پیشرفته",
    description: "با بهره‌وری بالا و تکنولوژی روز دنیا"
  },
  {
    image: controlRoom,
    title: "مرکز کنترل هوشمند",
    description: "نظارت و کنترل 24 ساعته تولید انرژی"
  },
  {
    image: solarFarmAerial,
    title: "نیروگاه خورشیدی",
    description: "ظرفیت تولید بالا با حداقل آلودگی زیست محیطی"
  }
]

export function SlideshowSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold py-4 mb-4 bg-gradient-solar bg-clip-text text-transparent">
            نگاهی به نیروگاه ما
          </h2>
          <p className="text-xl text-muted-foreground">
            آشنایی با امکانات و تجهیزات پیشرفته نیروگاه خورشیدی
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* اسلایدشو */}
          <div className="relative h-96 md:h-[600px] rounded-xl overflow-hidden shadow-2xl">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent">
                  <div className="absolute bottom-8 right-8 text-right">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 animate-solar-glow">
                      {slide.title}
                    </h3>
                    <p className="text-lg text-foreground/90 max-w-md">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* دکمه‌های ناوبری */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/50 border-primary/30 hover:border-primary animate-energy-pulse"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/50 border-primary/30 hover:border-primary animate-energy-pulse"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* نشانگرهای اسلاید */}
          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary animate-energy-pulse"
                    : "bg-muted hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}