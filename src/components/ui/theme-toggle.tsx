import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="animate-energy-pulse border-primary/30 hover:border-primary"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-primary animate-solar-glow" />
      ) : (
        <Moon className="h-4 w-4 text-primary" />
      )}
      <span className="sr-only">تغییر تم</span>
    </Button>
  )
}