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
    <div className="min-h-screen bg-gradient-energy">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24"> {/* Adjusted padding-top */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-solar bg-clip-text text-transparent mb-2">
            پنل کاربری
          </h1>
          <p className="text-muted-foreground">
            مدیریت حساب کاربری و تراکنش‌های شما
          </p>
        </div>

        <Tabs defaultValue="payments" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2"> {/* Changed from grid-cols-3 to grid-cols-2 */}
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              تراکنش‌ها
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              تنظیمات حساب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <UserPayments />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات حساب کاربری</CardTitle>
                <CardDescription>مدیریت اطلاعات پروفایل و امنیت</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  این بخش در نسخه بعدی پیاده‌سازی خواهد شد.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}