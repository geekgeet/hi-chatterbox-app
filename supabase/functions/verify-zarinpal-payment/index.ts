import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { authority, status } = await req.json();

    if (!authority) {
      throw new Error("Authority is required");
    }

    console.log(`Verifying payment for user ${user.id}, authority: ${authority}, status: ${status}`);

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment record from database
    const { data: payment, error: fetchError } = await supabaseService
      .from("payments")
      .select("*")
      .eq("authority", authority)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !payment) {
      throw new Error("Payment not found");
    }

    // Check if payment was cancelled by user
    if (status === "NOK") {
      const { error: updateError } = await supabaseService
        .from("payments")
        .update({ status: "cancelled" })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Database update error:", updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          status: "cancelled",
          message: "پرداخت توسط کاربر لغو شد" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get ZarinPal merchant ID from environment
    const merchantId = "2e1396c3-6ac2-4c29-94f6-370d7400fd0f"; //Deno.env.get("ZARINPAL_MERCHANT_ID");
    if (!merchantId) {
      throw new Error("ZarinPal merchant ID not configured");
    }

    // Verify payment with ZarinPal
    const verifyPayload = {
      merchant_id: merchantId,
      amount: payment.amount,
      authority: authority
    };

    console.log("ZarinPal verify payload:", verifyPayload);

    const zarinpalResponse = await fetch("https://sandbox.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    });

    const zarinpalResult = await zarinpalResponse.json();
    console.log("ZarinPal verify response:", zarinpalResult);

    let paymentStatus = "failed";
    let refId = null;

    if (zarinpalResult.data?.code === 100 || zarinpalResult.data?.code === 101) {
      // Payment successful (100 = new success, 101 = already verified)
      paymentStatus = "success";
      refId = zarinpalResult.data.ref_id;
    }

    // Update payment record in database
    const { error: updateError } = await supabaseService
      .from("payments")
      .update({ 
        status: paymentStatus,
        ref_id: refId
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Failed to update payment record");
    }

    return new Response(
      JSON.stringify({ 
        success: paymentStatus === "success",
        status: paymentStatus,
        ref_id: refId,
        amount: payment.amount,
        description: payment.description,
        message: paymentStatus === "success" 
          ? "پرداخت با موفقیت انجام شد" 
          : "پرداخت ناموفق بود"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        status: "error",
        error: error.message,
        message: "خطا در تأیید پرداخت"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});