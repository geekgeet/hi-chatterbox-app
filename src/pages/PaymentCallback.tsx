import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentResult {
  success: boolean;
  status: string;
  ref_id?: string;
  amount?: number;
  description?: string;
  message: string;
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    const verifyPayment = async () => {
      if (!user) {
        toast({
          title: "نیاز به ورود",
          description: "برای تایید پرداخت، لطفا ابتدا وارد شوید.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");

      if (!authority) {
        setPaymentResult({
          success: false,
          status: "error",
          message: "اطلاعات پرداخت یافت نشد. مشکلی در بازگشت از درگاه رخ داده است."
        });
        setVerificationLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-zarinpal-payment', {
          body: {
            authority,
            status
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        setPaymentResult(data);
        
        if (data.success) {
          toast({
            title: "پرداخت موفق",
            description: `پرداخت شما با موفقیت انجام شد. کد رهگیری: ${data.ref_id}`,
          });
        } else {
          toast({
            title: "پرداخت ناموفق",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setPaymentResult({
          success: false,
          status: "error",
          message: error.message || "خطا در بررسی وضعیت پرداخت"
        });
        toast({
          title: "خطا",
          description: error.message || "خطا در بررسی وضعیت پرداخت",
          variant: "destructive",
        });
      } finally {
        setVerificationLoading(false);
      }
    };

    verifyPayment();
  }, [authLoading, user, searchParams, navigate, toast]);

  const getStatusIcon = () => {
    if (verificationLoading || authLoading) return <Loader2 className="w-16 h-16 animate-spin text-primary" />;
    
    switch (paymentResult?.status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    if (verificationLoading || authLoading) return "در حال بررسی پرداخت...";
    
    switch (paymentResult?.status) {
      case "success":
        return "پرداخت موفق";
      case "cancelled":
        return "پرداخت لغو شده";
      default:
        return "پرداخت ناموفق";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentResult && !verificationLoading && (
            <>
              <div className="text-center text-muted-foreground">
                {paymentResult.message}
              </div>
              
              {paymentResult.success && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  {paymentResult.ref_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">کد رهگیری:</span>
                      <span className="font-mono">{paymentResult.ref_id}</span>
                    </div>
                  )}
                  {paymentResult.amount && (
                    <div className="flex justify-between">
                      <span className="font-medium">مبلغ:</span>
                      <span>{formatAmount(paymentResult.amount)} تومان</span>
                    </div>
                  )}
                  {paymentResult.description && (
                    <div className="flex justify-between">
                      <span className="font-medium">شرح:</span>
                      <span className="text-right">{paymentResult.description}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => navigate("/")} 
              className="flex-1"
            >
              برگشت به صفحه اصلی
            </Button>
            <Button 
              onClick={() => navigate("/user/payments")} 
              variant="outline"
              className="flex-1"
            >
              تاریخچه پرداخت‌ها
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
