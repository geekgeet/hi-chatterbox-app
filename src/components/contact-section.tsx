import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Send } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "پیام ارسال شد",
      description: "پیام شما با موفقیت ارسال شد. ما در اسرع وقت با شما تماس خواهیم گرفت.",
    })
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-solar bg-clip-text text-transparent">
            تماس با ما
          </h2>
          <p className="text-xl text-muted-foreground">
            برای کسب اطلاعات بیشتر و مشاوره رایگان با ما در تماس باشید
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* فرم تماس */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-energy-pulse">
            <CardHeader>
              <CardTitle className="text-right text-2xl text-foreground">
                فرم تماس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">نام و نام خانوادگی</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="text-right bg-input/50 border-primary/30 focus:border-primary"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">ایمیل</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="text-right bg-input/50 border-primary/30 focus:border-primary"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">شماره تماس</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="text-right bg-input/50 border-primary/30 focus:border-primary"
                    placeholder="شماره تماس خود را وارد کنید"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-right block">پیام</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="text-right bg-input/50 border-primary/30 focus:border-primary resize-none"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-solar hover:scale-105 transition-all duration-300"
                >
                  ارسال پیام
                  <Send className="mr-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* اطلاعات تماس */}
          <div className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-primary animate-energy-pulse" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-foreground">تلفن</h3>
                    <p className="text-muted-foreground">021-12345678</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-secondary animate-energy-pulse" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-foreground">ایمیل</h3>
                    <p className="text-muted-foreground">info@khorshid-zarin.ir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-energy/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-energy animate-energy-pulse" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-foreground">آدرس</h3>
                    <p className="text-muted-foreground">
                      تهران، منطقه صنعتی، کیلومتر 15 جاده ساوه
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-solar p-6 text-background">
              <h3 className="text-xl font-bold mb-4">ساعات کاری</h3>
              <div className="space-y-2 text-right">
                <p>شنبه تا چهارشنبه: 8:00 - 17:00</p>
                <p>پنج‌شنبه: 8:00 - 13:00</p>
                <p>جمعه: تعطیل</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}