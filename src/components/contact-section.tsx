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
    <section className="py-16 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold py-4 mb-4 bg-gradient-solar bg-clip-text text-transparent">
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
                    <p className="text-muted-foreground">071-91002181</p>
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
                    <p className="text-muted-foreground">info@khzki.com</p>
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
                    شهرک صنعتی بزرگ شیراز، بلوار پژوهش شمالی، خیابان ۲۶۰
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Map */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                <iframe 
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d4063.31003121489!2d52.53511907607867!3d30.844931580200694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzDCsDUwJzQxLjciTiA1MsKwMzInMTUuNyJF!5e1!3m2!1sen!2sus!4v1754218384197!5m2!1sen!2sus" 
                width="100%" 
                height="250" 
                style={{border:0}} 
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </Card>

            {/* ساعات کاری */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-4 text-right">
                    <h3 className="font-semibold text-foreground mb-2 text-md">ساعات کاری</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                    <p>شنبه تا چهارشنبه: ۸:۰۰ - ۱۷:۰۰</p>
                    <p>پنج‌شنبه: ۸:۰۰ - ۱۳:۰۰</p>
                    <p>جمعه: تعطیل</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}