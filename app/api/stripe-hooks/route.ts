import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

export async function POST(request: NextRequest) {
    const supabase = createRouteHandlerClient<Database>({cookies});

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const endpointSecret = process.env.STRIPE_SIGNING_SECRET as string;
    const signature = request.headers.get('stripe-signature');

    const reqBuffer = Buffer.from(await request.arrayBuffer());

    let event;

    try {
        event = stripe.webhooks.constructEvent(reqBuffer, signature!, endpointSecret);
        switch (event.type) {
            case 'customer.subscription.created':
                const customerSubscriptionCreated = event.data.object;
                await supabase.from("profile").update({
                    is_subscribed: true,
                    interval: customerSubscriptionCreated.items.data[0].plan.interval
                }).eq("stripe_customer", event.data.object.customer as string);
                
                break;
            case 'customer.subscription.deleted':
                const customerSubscriptionDeleted = event.data.object;
                await supabase.from("profile").update({
                    is_subscribed: true,
                    interval: customerSubscriptionDeleted.items.data[0].plan.interval
                }).eq("stripe_customer", event.data.object.customer as string);

                break;
            case 'customer.subscription.updated':
                const customerSubscriptionUpdated = event.data.object;
                await supabase.from("profile").update({
                    is_subscribed: false,
                    interval: null
                }).eq("stripe_customer", event.data.object.customer as string);
                
                break;

            default:
            console.log(`Unhandled event type ${event.type}`);
        }

        console.log(event);
    } catch (err: any) {
        NextResponse.json(`Webhook Error: ${err.message}`, {status: 401});
        return;
    }

    return NextResponse.json({
        received: true,
    });
}