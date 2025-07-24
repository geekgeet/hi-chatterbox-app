import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sun, Menu, X, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <Sun className="w-8 h-8 text-primary animate-solar-glow" />
            <span className="text-xl font-bold bg-gradient-solar bg-clip-text text-transparent">
              خورشید زرین کیان
            </span>
          </div>

          {/* منوی دسکتاپ */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            <button 
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors"
            >
              خانه
            </button>
            <button 
              onClick={() => scrollToSection("slideshow")}
              className="text-foreground hover:text-primary transition-colors"
            >
              گالری
            </button>
            <button 
              onClick={() => scrollToSection("content")}
              className="text-foreground hover:text-primary transition-colors"
            >
              اخبار
            </button>
            <button 
              onClick={() => scrollToSection("calculator")}
              className="text-foreground hover:text-primary transition-colors"
            >
              محاسبه‌گر
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors"
            >
              تماس
            </button>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 ml-1" />
                      پنل ادمین
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 ml-1" />
                  خروج
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary">
                  <User className="w-4 h-4 ml-1" />
                  ورود
                </Button>
              </Link>
            )}
            <ThemeToggle />
            
            {/* دکمه منوی موبایل */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden border-primary/30 hover:border-primary"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* منوی موبایل */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-primary/20 py-4">
            <div className="flex flex-col space-y-3 text-right">
              <button 
                onClick={() => scrollToSection("hero")}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                خانه
              </button>
              <button 
                onClick={() => scrollToSection("slideshow")}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                گالری
              </button>
              <button 
                onClick={() => scrollToSection("content")}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                اخبار
              </button>
              <button 
                onClick={() => scrollToSection("calculator")}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                محاسبه‌گر
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                تماس
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}