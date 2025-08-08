import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface Payment {
  id: string
  amount: number
  status: string
  description: string
  customer_type?: string
  consumption?: number
  ref_id?: string
  card_pan?: string
  authority?: string
  created_at: string
  verified_at?: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('payments-list')
        
        if (error) {
          console.error('Error fetching payments:', error)
        } else if (data?.payments) {
          setPayments(data.payments)
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          تکمیل شده
        </Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          در انتظار
        </Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          ناموفق
        </Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <XCircle className="h-3 w-3 mr-1" />
          لغو شده
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>دسترسی محدود</CardTitle>
              <CardDescription>
                برای مشاهده تراکنش‌ها باید وارد حساب کاربری شوید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/auth">ورود به حساب کاربری</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              بازگشت
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تراکنش‌های من</h1>
            <p className="text-muted-foreground">مشاهده تاریخچه پرداخت‌های شما</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              لیست تراکنش‌ها
            </CardTitle>
            <CardDescription>
              تمامی پرداخت‌های انجام شده توسط شما
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto mb-4 animate-spin" />
                <p>در حال بارگذاری...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">هیچ تراکنشی یافت نشد</h3>
                <p className="text-muted-foreground mb-4">شما هنوز هیچ پرداختی انجام نداده‌اید</p>
                <Button asChild>
                  <Link to="/">شروع پرداخت</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>کد پیگیری</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          {payment.customer_type && payment.consumption && (
                            <p className="text-sm text-muted-foreground">
                              {payment.customer_type} - {payment.consumption} کیلووات ساعت
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {payment.amount.toLocaleString()} ریال
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.ref_id ? (
                          <span className="font-mono text-sm">{payment.ref_id}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}