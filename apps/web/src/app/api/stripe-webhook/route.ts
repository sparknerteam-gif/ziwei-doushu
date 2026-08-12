import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook: track purchases in Supabase
// This runs when someone completes a payment on Stripe

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") || "";

    // Basic validation (expand with stripe library for production)
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email || "";
      const amount = session.amount_total / 100;
      const productName = session.metadata?.product_name || "Unknown";
      const questionsIncluded = parseInt(session.metadata?.questions_included || "0");
      const paymentId = session.id;

      console.log("💰 PAYMENT RECEIVED:");
      console.log("  Email:", email);
      console.log("  Amount:", "$" + amount);
      console.log("  Product:", productName);
      console.log("  Questions:", questionsIncluded);
      console.log("  Payment ID:", paymentId);

      // Save to Supabase
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase.from("purchases").insert({
          payment_id: paymentId,
          email: email,
          product: productName,
          amount: amount,
          questions_included: questionsIncluded,
          questions_used: 0,
          purchased_at: new Date().toISOString(),
        });

        if (error) {
          console.error("⚠ Failed to save purchase:", error.message);
        } else {
          console.log("✓ Purchase saved to Supabase");
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
