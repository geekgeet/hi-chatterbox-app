import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import UserPayments from './UserPayments'; // Import the UserPayments component

export default function UserPanel() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    // Redirect if not logged in after loading
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-energy">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Should be handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-6 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-solar">
              <Settings className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-solar bg-clip-text text-transparent">
                پنل کاربری
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                خوش آمدید {user?.email}
              </p>
            </div>
          </div>
          
          {/* Welcome Card */}
          <Card className="border-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-energy/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    مدیریت حساب کاربری
                  </h2>
                  <p className="text-muted-foreground">
                    از این قسمت می‌توانید تراکنش‌های خود را مشاهده و تنظیمات حساب کاربری‌تان را مدیریت کنید
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">تراکنش</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">فعال</div>
                    <div className="text-sm text-muted-foreground">وضعیت</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-8" onValueChange={setActiveTab}>
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-2 w-fit bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg p-1 rounded-xl">
              <TabsTrigger value="payments" className="flex items-center gap-3 px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                <CreditCard className="w-5 h-5" />
                تراکنش‌ها
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-3 px-8 py-4 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all duration-300">
                <Settings className="w-5 h-5" />
                تنظیمات حساب
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payments">
            <UserPayments />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent p-8 rounded-t-lg">
                <CardTitle className="text-2xl text-secondary flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  تنظیمات حساب کاربری
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مدیریت اطلاعات پروفایل و امنیت حساب کاربری
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-gradient-to-r from-muted/30 to-transparent border border-border/50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        اطلاعات حساب
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ایمیل:</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">وضعیت:</span>
                          <span className="font-medium text-green-500">فعال</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">تاریخ عضویت:</span>
                          <span className="font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('fa-IR') : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-border/50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        قابلیت‌های آینده
                      </h3>
                      <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>ویرایش اطلاعات پروفایل</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span>تغییر رمز عبور</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-energy"></div>
                          <span>تنظیمات اعلان‌ها</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                          <span>مدیریت امنیت دو مرحله‌ای</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-muted/20 to-transparent border border-border/30">
                  <p className="text-center text-muted-foreground">
                    این قابلیت‌ها در نسخه‌های آینده پیاده‌سازی خواهند شد.
                  </p>
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