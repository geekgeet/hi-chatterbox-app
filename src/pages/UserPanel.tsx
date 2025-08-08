import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CreditCard, 
  User, 
  Mail, 
  Calendar,
  TrendingUp,
  Zap,
  Star,
  Package,
  Bell,
  Shield,
  Edit,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPayment {
  id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  ref_id: string | null;
}

interface UserPurchase {
  id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  expiry_date: string | null;
  created_at: string;
  electricity_packages?: {
    name: string;
    kwh_amount: number;
    duration_months: number;
  };
}

export default function UserPanel() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    await Promise.all([
      fetchPayments(),
      fetchPurchases()
    ]);
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    setPaymentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری تراکنش‌ها',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    if (!user) return;
    
    setPurchasesLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          electricity_packages(name, kwh_amount, duration_months)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری خریدها',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPurchasesLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/10">
        <div className="text-center space-y-4">
          <div className="animate-solar-glow">
            <User className="w-16 h-16 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground text-lg">در حال بارگذاری پنل کاربری...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = payments.filter(p => p.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const activePurchases = purchases.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10">
      <Navbar />
      
      {/* Main Container */}
      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-solar shadow-lg animate-energy-pulse">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-solar bg-clip-text text-transparent">
                پنل کاربری
              </h1>
              <p className="text-muted-foreground text-xl mt-2">
                خوش آمدید، {user?.email}
              </p>
            </div>
          </div>

          {/* Welcome Stats Card */}
          <Card className="border-0 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-lg shadow-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
                  <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">کل خرید</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(totalSpent)}</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/20">
                  <div className="p-3 rounded-xl bg-secondary/20 w-fit mx-auto mb-3">
                    <Package className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">پکیج‌های فعال</p>
                  <p className="text-xl font-bold text-secondary">{activePurchases}</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-energy/20 to-transparent border border-energy/20">
                  <div className="p-3 rounded-xl bg-energy/20 w-fit mx-auto mb-3">
                    <CreditCard className="w-8 h-8 text-energy" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">تراکنش‌ها</p>
                  <p className="text-xl font-bold text-energy">{payments.length}</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20">
                  <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto mb-3">
                    <Star className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">وضعیت</p>
                  <p className="text-xl font-bold text-accent">فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-4 w-fit bg-card/80 backdrop-blur-lg border border-border/50 shadow-2xl p-2 rounded-2xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <TrendingUp className="w-5 h-5" />
                داشبورد
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <CreditCard className="w-5 h-5" />
                تراکنش‌ها
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-energy data-[state=active]:to-energy data-[state=active]:text-white data-[state=active]:shadow-electric transition-all duration-300 rounded-xl">
                <Package className="w-5 h-5" />
                خریدها
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <Settings className="w-5 h-5" />
                تنظیمات
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                  <CardTitle className="text-xl text-primary flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    فعالیت اخیر
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/20 to-transparent border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <CreditCard className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-primary">{formatCurrency(payment.amount)}</p>
                          <Badge 
                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                            className={payment.status === 'completed' ? 'bg-energy/10 text-energy' : 'bg-secondary/10 text-secondary'}
                          >
                            {payment.status === 'completed' ? 'تکمیل شده' : 'در انتظار'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {payments.length === 0 && (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">هنوز تراکنشی انجام نشده است</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Packages */}
              <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent border-b border-border/50">
                  <CardTitle className="text-xl text-secondary flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    پکیج‌های فعال
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {purchases.filter(p => p.status === 'completed').slice(0, 3).map((purchase) => (
                      <div key={purchase.id} className="p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">
                            {purchase.electricity_packages?.name}
                          </h4>
                          <Badge className="bg-energy/10 text-energy border-energy/20">
                            فعال
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">میزان: </span>
                            <span className="font-medium">{purchase.electricity_packages?.kwh_amount} کیلووات ساعت</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">مدت: </span>
                            <span className="font-medium">{purchase.electricity_packages?.duration_months} ماه</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {purchases.filter(p => p.status === 'completed').length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">هنوز پکیجی خریداری نشده است</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl text-secondary flex items-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  تراکنش‌های مالی
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  تاریخچه پرداخت‌ها و تراکنش‌های شما
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-8 h-8 animate-pulse text-secondary mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری تراکنش‌ها...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز تراکنشی انجام نشده است</p>
                    <Button className="mt-4 bg-gradient-solar" onClick={() => navigate('/payments')}>
                      شروع خرید
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-6 rounded-xl bg-gradient-to-r from-card to-card/50 border border-border/30 hover:border-secondary/30 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              payment.status === 'completed' ? 'bg-energy/20' : 'bg-secondary/20'
                            }`}>
                              <CreditCard className={`w-6 h-6 ${
                                payment.status === 'completed' ? 'text-energy' : 'text-secondary'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {payment.description}
                              </h3>
                              <p className="text-muted-foreground">
                                {formatDate(payment.created_at)}
                              </p>
                              {payment.ref_id && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  شناسه: {payment.ref_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-bold text-primary mb-2">
                              {formatCurrency(payment.amount)}
                            </p>
                            <Badge 
                              variant={payment.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                payment.status === 'completed' ? 'bg-energy/10 text-energy border-energy/20' :
                                payment.status === 'pending' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                'bg-destructive/10 text-destructive border-destructive/20'
                              }
                            >
                              {payment.status === 'completed' ? 'تکمیل شده' :
                               payment.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-energy/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl text-energy flex items-center gap-3">
                  <Package className="w-6 h-6" />
                  پکیج‌های خریداری شده
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مشاهده پکیج‌های برق خورشیدی خریداری شده
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {purchasesLoading ? (
                  <div className="text-center py-12">
                    <Package className="w-8 h-8 animate-pulse text-energy mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری خریدها...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز پکیجی خریداری نشده است</p>
                    <Button className="mt-4 bg-gradient-solar" onClick={() => navigate('/payments')}>
                      مشاهده پکیج‌ها
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {purchases.map((purchase) => (
                      <Card key={purchase.id} className="border-0 bg-gradient-to-br from-energy/10 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-xl bg-energy/20">
                                <Zap className="w-6 h-6 text-energy" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {purchase.electricity_packages?.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(purchase.created_at)}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                purchase.status === 'completed' ? 'bg-energy/10 text-energy border-energy/20' :
                                'bg-secondary/10 text-secondary border-secondary/20'
                              }
                            >
                              {purchase.status === 'completed' ? 'فعال' : 'در انتظار'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">میزان برق:</span>
                              <span className="font-semibold">{purchase.electricity_packages?.kwh_amount} کیلووات ساعت</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">مدت زمان:</span>
                              <span className="font-semibold">{purchase.electricity_packages?.duration_months} ماه</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">مبلغ:</span>
                              <span className="font-semibold text-primary">{formatCurrency(purchase.amount)}</span>
                            </div>
                            {purchase.expiry_date && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">انقضا:</span>
                                <span className="font-semibold">{formatDate(purchase.expiry_date)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl text-accent flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  تنظیمات حساب کاربری
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مدیریت اطلاعات پروفایل و تنظیمات حساب
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Account Information */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
                        <User className="w-5 h-5 text-accent" />
                        اطلاعات حساب
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ایمیل:</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">وضعیت:</span>
                          <Badge className="bg-energy/10 text-energy border-energy/20">فعال</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">تاریخ عضویت:</span>
                          <span className="font-medium">
                            {user?.created_at ? formatDate(user.created_at) : '-'}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 border-accent/30 hover:bg-accent/10">
                        <Edit className="w-4 h-4 ml-2" />
                        ویرایش اطلاعات
                      </Button>
                    </div>
                  </div>
                  
                  {/* Security & Features */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        امنیت و قابلیت‌ها
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span>احراز هویت دو مرحله‌ای</span>
                          </div>
                          <Badge variant="outline">غیرفعال</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <span>اعلان‌های ایمیل</span>
                          </div>
                          <Badge className="bg-energy/10 text-energy">فعال</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span>دانلود گزارش</span>
                          </div>
                          <Badge className="bg-secondary/10 text-secondary">دردسترس</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 border-primary/30 hover:bg-primary/10">
                        <Settings className="w-4 h-4 ml-2" />
                        مدیریت امنیت
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Future Features Notice */}
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-muted/20 to-transparent border border-border/30">
                  <div className="text-center">
                    <Star className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">قابلیت‌های در حال توسعه</h3>
                    <p className="text-muted-foreground">
                      امکانات جدید و بهبودهای سیستم به زودی اضافه خواهند شد
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}