import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "認証されていません" },
            { status: 401 }
        );
    }

    const { data: profile } = await supabase
        .from("profile")
        .select("stripe_customer")
        .eq("id", user.id)
        .single();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const session = await stripe.billingPortal.sessions.create({
        customer: profile?.stripe_customer as string,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
}