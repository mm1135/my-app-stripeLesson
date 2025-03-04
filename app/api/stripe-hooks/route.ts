import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_SIGNING_SECRET as string
        );
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json(
            { error: "Webhookの検証に失敗しました" },
            { status: 400 }
        );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // イベントの型を確認して処理
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
            .from("profile")
            .update({ 
                is_subscribed: subscription.status === "active",
                interval: subscription.items.data[0]?.plan.interval || null
            })
            .eq("stripe_customer", subscription.customer as string);
    }

    return NextResponse.json({ received: true });
}