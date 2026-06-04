import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const TIER_PRICES: Record<string, Record<string, number>> = {
  PREMIUM: { monthly: 999, yearly: 8999 },   // cents
  VIP:     { monthly: 2499, yearly: 19999 },
};

export async function POST(req: NextRequest) {
  try {
    const { tier, billing, modelslug, clientId } = await req.json();

    if (!TIER_PRICES[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceInCents = TIER_PRICES[tier][billing] ?? TIER_PRICES[tier].monthly;
    const interval = billing === "yearly" ? "year" : "month";
    const labelBilling = billing === "yearly" ? "/ year" : "/ month";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceInCents,
            recurring: { interval },
            product_data: {
              name: `${tier} Subscription — ${modelslug}`,
              description: `${tier} tier membership ${labelBilling}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?canceled=1`,
      metadata: { tier, billing, clientId, modelslug, type: "subscription" },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("Stripe subscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
