import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Zap, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PriceCalculator() {
  const [consumption, setConsumption] = useState("")
  const [customerType, setCustomerType] = useState("")
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const { toast } = useToast()

  const calculatePrice = () => {
    if (!consumption || !customerType) {
      toast({
        title: "خطا",
        description: "لطفا تمام فیلدها را پر کنید",
        variant: "destructive"
      })
      return
    }

    const consumptionNum = parseInt(consumption)
    let rate = 0

    // نرخ‌های مختلف بر اساس نوع مشترک
    switch (customerType) {
      case "residential":
        rate = 1500 // ریال به ازای هر کیلووات ساعت
        break
      case "commercial":
        rate = 2000
        break
      case "industrial":
        rate = 1800
        break
      default:
        rate = 1500
    }

    const totalPrice = consumptionNum * rate
    setCalculatedPrice(totalPrice)
  }

  const handlePayment = () => {
    if (!calculatedPrice) return
    
    toast({
      title: "انتقال به درگاه پرداخت",
      description: "در حال انتقال به صفحه پرداخت امن...",
    })
    
    // اینجا می‌توان به درگاه پرداخت واقعی متصل شد
    setTimeout(() => {
      window.open("#payment", "_blank")
    }, 1000)
  }

  return (
    <section className="py-16 bg-gradient-energy">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-solar bg-clip-text text-transparent">
            محاسبه‌گر قیمت برق
          </h2>
          <p className="text-xl text-muted-foreground">
            قیمت برق مصرفی خود را محاسبه کرده و آنلاین پرداخت کنید
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* فرم محاسبه */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 animate-energy-pulse">
              <CardHeader>
                <CardTitle className="text-right text-2xl text-foreground flex items-center">
                  <Calculator className="ml-3 w-6 h-6 text-primary" />
                  محاسبه مصرف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="consumption" className="text-right block">
                    میزان مصرف (کیلووات ساعت)
                  </Label>
                  <Input
                    id="consumption"
                    type="number"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                    className="text-right bg-input/50 border-primary/30 focus:border-primary"
                    placeholder="مثال: 300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-right block">نوع مشترک</Label>
                  <Select value={customerType} onValueChange={setCustomerType}>
                    <SelectTrigger className="text-right bg-input/50 border-primary/30 focus:border-primary">
                      <SelectValue placeholder="نوع مشترک را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">خانگی</SelectItem>
                      <SelectItem value="commercial">تجاری</SelectItem>
                      <SelectItem value="industrial">صنعتی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculatePrice}
                  className="w-full bg-gradient-solar hover:scale-105 transition-all duration-300"
                >
                  محاسبه قیمت
                  <Zap className="mr-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* نتیجه محاسبه */}
            <Card className="bg-card/80 backdrop-blur-sm border-secondary/20 hover:border-secondary/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-right text-2xl text-foreground">
                  نتیجه محاسبه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {calculatedPrice ? (
                  <>
                    <div className="text-center p-6 bg-gradient-solar rounded-lg">
                      <h3 className="text-2xl font-bold text-background mb-2">
                        مبلغ قابل پرداخت
                      </h3>
                      <p className="text-4xl font-bold text-background">
                        {calculatedPrice.toLocaleString()} ریال
                      </p>
                    </div>

                    <div className="space-y-3 text-right">
                      <p className="text-muted-foreground">
                        <span className="font-semibold">میزان مصرف:</span> {consumption} کیلووات ساعت
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-semibold">نوع مشترک:</span> {
                          customerType === "residential" ? "خانگی" :
                          customerType === "commercial" ? "تجاری" : "صنعتی"
                        }
                      </p>
                    </div>

                    <Button 
                      onClick={handlePayment}
                      className="w-full bg-energy hover:bg-energy/90 text-energy-foreground hover:scale-105 transition-all duration-300"
                    >
                      پرداخت آنلاین
                      <CreditCard className="mr-2 w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لطفا اطلاعات مصرف خود را وارد کرده و قیمت را محاسبه کنید</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* جدول نرخ‌ها */}
          <Card className="mt-8 bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-right text-xl text-foreground">
                جدول نرخ‌های برق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="p-3 text-foreground">نوع مشترک</th>
                      <th className="p-3 text-foreground">نرخ (ریال/کیلووات ساعت)</th>
                      <th className="p-3 text-foreground">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">خانگی</td>
                      <td className="p-3 text-primary font-semibold">1,500</td>
                      <td className="p-3 text-muted-foreground">مصرف خانوار</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">تجاری</td>
                      <td className="p-3 text-secondary font-semibold">2,000</td>
                      <td className="p-3 text-muted-foreground">ادارات و مغازه‌ها</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">صنعتی</td>
                      <td className="p-3 text-energy font-semibold">1,800</td>
                      <td className="p-3 text-muted-foreground">کارخانه‌ها و صنایع</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}