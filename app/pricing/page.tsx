import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createServerComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import React from 'react'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import SubscriptionButton from '@/components/checkout/SubscriptionButton'
import AuthServerButton from '@/components/auth/AuthServerButton'

// 価格情報を含む商品データの型定義
type PlanWithPrice = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  currency: string;
  priceId: string;
}

const getAllPlans = async (): Promise<PlanWithPrice[]> => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

  // 価格情報を取得（商品情報も含める）
  const { data: prices } = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
  });

  // 必要な情報を抽出して整形
  const plans: PlanWithPrice[] = prices.map(price => {
    // 商品情報を取得（expandで取得した商品情報）
    const product = price.product as Stripe.Product;
    
    // 価格情報を整形
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: price.unit_amount ? price.unit_amount / 100 : 0, // セント単位から通貨単位に変換
      interval: price.type === 'recurring' && price.recurring ? price.recurring.interval : 'one-time',
      currency: price.currency,
      priceId: price.id
    };
  });

  return plans;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

const formatInterval = (interval: string) => {
  const intervalMap: Record<string, string> = {
    'day': '日',
    'week': '週間',
    'month': '月',
    'year': '年',
    'one-time': '一回限り'
  };
  
  return intervalMap[interval] || interval;
}

const getProfile = async (supabase: SupabaseClient<Database>) => {
    const {data: profile} = await supabase.from('profile').select('*').single();
    return profile;
}

const PricingPage = async () => {
    const supabase = createServerComponentClient({cookies});

    const { data: user } = await supabase.auth.getSession();

    const [plans, profile] = await Promise.all([
        await getAllPlans(),
        await getProfile(supabase)
    ]);

    console.log(profile);

    const showSubscribeButton = !!user.session && !profile?.is_subscribed;

    const showCreateAccountButton = !user.session;

    const showManageSubscriptionButton = !!user.session && profile?.is_subscribed;

  return (
    <div className='w-full max-w-5xl mx-auto py-16 px-4'>
      <h1 className='text-3xl font-bold text-center mb-10'>料金プラン</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {plans.map((plan) => (
          <Card className="hover:shadow-lg transition-shadow" key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>
                {formatCurrency(plan.price, plan.currency)}
                <span className='text-sm font-normal text-gray-500 ml-1'>
                  / {formatInterval(plan.interval)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
                {showSubscribeButton && <SubscriptionButton planId={plan.priceId}/>}
                {showCreateAccountButton && <AuthServerButton />}
                {showManageSubscriptionButton && <Button className='w-full'>サブスクリプションを管理する</Button>}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PricingPage