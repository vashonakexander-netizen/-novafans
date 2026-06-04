import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

export async function POST(req: NextRequest) {
  try {
    const { productId, productTitle, priceInCents, modelslug, clientId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(priceInCents),
            product_data: {
              name: productTitle,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/${modelslug}?canceled=1`,
      metadata: { productId, clientId, modelslug, type: "purchase" },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("Stripe purchase error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
