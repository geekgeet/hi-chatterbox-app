import { Sun, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-primary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* لوگو و توضیحات */}
          <div className="text-right">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <Sun className="w-8 h-8 text-primary animate-solar-glow" />
              <span className="text-xl font-bold bg-gradient-solar bg-clip-text text-transparent">
                خورشید زرین کیان
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نیروگاه خورشیدی پیشرو در تولید انرژی پاک و تجدیدپذیر با هدف کاهش آلودگی 
              و حفظ محیط زیست برای آینده‌ای پایدار.
            </p>
          </div>

          {/* لینک‌های سریع */}
          <div className="text-right">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              لینک‌های سریع
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-muted-foreground hover:text-primary transition-colors">
                  صفحه اصلی
                </a>
              </li>
              <li>
                <a href="#slideshow" className="text-muted-foreground hover:text-primary transition-colors">
                  گالری تصاویر
                </a>
              </li>
              <li>
                <a href="#content" className="text-muted-foreground hover:text-primary transition-colors">
                  اخبار و مطالب
                </a>
              </li>
              <li>
                <a href="#calculator" className="text-muted-foreground hover:text-primary transition-colors">
                  محاسبه‌گر قیمت
                </a>
              </li>
            </ul>
          </div>

          {/* خدمات */}
          <div className="text-right">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              خدمات ما
            </h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">تولید انرژی خورشیدی</li>
              <li className="text-muted-foreground">فروش برق</li>
              <li className="text-muted-foreground">مشاوره انرژی</li>
              <li className="text-muted-foreground">نگهداری تجهیزات</li>
            </ul>
          </div>

          {/* اطلاعات تماس */}
          <div className="text-right">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              اطلاعات تماس
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">021-12345678</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">info@khorshid-zarin.ir</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="w-4 h-4 text-energy" />
                <span className="text-muted-foreground">تهران، جاده ساوه</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 1403 خورشید زرین کیان. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  )
}