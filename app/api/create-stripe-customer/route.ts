import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe"
import { cookies } from "next/headers";

export async function POST(request: NextRequest){
    const supabase = createRouteHandlerClient({cookies})

    const query = request.nextUrl.searchParams.get("API_ROUTE_SECRET")

    if(query !== process.env.API_ROUTE_SECRET){
        return NextResponse.json({
            message: "APIを叩く権限がありません",
        }, {status: 401})
    }

    const data = await request.json()
    const {id, email} = data.record

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

    const customer = await stripe.customers.create({
        email,
    })

    await supabase.from('profile').update({
        stripe_customer: customer.id,
    }).eq('id', id)

    return NextResponse.json({
        message: `stripe customer created: ${customer.id}`,
    })
}