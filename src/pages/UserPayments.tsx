import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  description: string;
  authority: string;
  ref_id: string | null;
  status: string;
  created_at: string;
}

export default function UserPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPayments(data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast({
          title: "خطا",
          description: "خطا در دریافت تاریخچه پرداخت‌ها",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, navigate, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">موفق</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">در انتظار</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">لغو شده</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">ناموفق</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4"> {/* Removed outer div and padding/margin classes */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">هیچ پرداختی یافت نشد</h3>
            <p className="text-muted-foreground mb-4">شما هنوز هیچ پرداختی انجام نداده‌اید</p>
            <Button onClick={() => navigate("/")}>
              برگشت به صفحه اصلی
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{payment.description}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(payment.created_at)}
                    </div>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">مبلغ</p>
                    <p className="text-lg font-semibold">{formatAmount(payment.amount)} تومان</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">کد Authority</p>
                    <p className="text-sm font-mono break-all">{payment.authority}</p>
                  </div>
                  {payment.ref_id && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">کد رهگیری</p>
                      <p className="text-sm font-mono">{payment.ref_id}</p>
                    </div>
                  )}
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        // Could add a detailed view modal here
                        toast({
                          title: "جزئیات پرداخت",
                          description: `وضعیت: ${payment.status === 'success' ? 'موفق' : 'ناموفق'}`,
                        });
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      جزئیات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}