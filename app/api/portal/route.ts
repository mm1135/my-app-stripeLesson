import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

export async function GET(request: NextRequest, {params}: {params: Promise<{priceid: string}>}) {
    
    const supabase = createRouteHandlerClient({cookies});

    const {data} = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {data: stripe_customer_data} = await supabase.from("profile").select("stripe_customer").eq("id", user?.id).single();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const session = await stripe.billingPortal.sessions.create({
        customer: stripe_customer_data?.stripe_customer,
        return_url: "http://localhost:3000/dashboard",
    })

    return NextResponse.json({
        url: session.url,
    })
}