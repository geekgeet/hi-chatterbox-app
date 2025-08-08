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
    const { amount, description, mobile, email } = await req.json();

    if (!amount || !description) {
      throw new Error("Amount and description are required");
    }

    // Get ZarinPal merchant ID from environment
    const merchantId = "2e1396c3-6ac2-4c29-94f6-370d7400fd0f"; //Deno.env.get("ZARINPAL_MERCHANT_ID");
    if (!merchantId) {
      throw new Error("ZarinPal merchant ID not configured");
    }

    console.log(`Creating payment for user ${user.id}, amount: ${amount}`);

    // ZarinPal payment request
    const callbackUrl = `${req.headers.get("origin")}/payment-callback`;
    const zarinpalPayload = {
      merchant_id: merchantId,
      amount: amount, // Amount in Tomans
      description: description,
      callback_url: callbackUrl,
      metadata: {
        mobile: mobile || "",
        email: email || user.email || ""
      }
    };

    console.log("ZarinPal payload:", zarinpalPayload);

    // Call ZarinPal API
    const zarinpalResponse = await fetch("https://sandbox.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zarinpalPayload),
    });

    const zarinpalResult = await zarinpalResponse.json();
    console.log("ZarinPal response:", zarinpalResult);

    if (zarinpalResult.data?.code !== 100) {
      throw new Error(`ZarinPal error: ${zarinpalResult.errors?.join(", ") || "Unknown error"}`);
    }

    const authority = zarinpalResult.data.authority;

    // Save payment record to database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService.from("payments").insert({
      user_id: user.id,
      amount: amount,
      description: description,
      authority: authority,
      status: "pending",
      mobile: mobile,
      email: email || user.email,
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save payment record");
    }

    // Return payment URL
    const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentUrl: paymentUrl,
        authority: authority 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});