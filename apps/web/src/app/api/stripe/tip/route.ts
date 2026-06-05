import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { amount, modelslug, clientId } = await req.json();
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (amountInCents < 100) {
      return NextResponse.json({ error: "Minimum tip is $1" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `Tip for ${modelslug}`,
              description: "One-time tip to support your favorite creator 💕",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?tipped=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?canceled=1`,
      metadata: { clientId, modelslug, type: "tip", amount: String(amount) },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("Stripe tip error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
