import { Database } from '@/lib/database.types';
import { createServerComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import React from 'react'
import { cookies } from 'next/headers';
import SubscriptionManagementButton from '@/components/checkout/SubscriptionManagementButton';
const getProfile = async (supabase: SupabaseClient<Database>) => {
    const {data: profile} = await supabase.from('profile').select('*').single();
    return profile;
}

const DashboardPage = async () => {
    const supabase = createServerComponentClient({cookies});

    const profile = await getProfile(supabase);

  return (
    <div className='w-full max-w-3xl mx-auto py-16 px-8'>
        <h1 className='text-2xl font-bold'>ユーザー管理ダッシュボード</h1>
        <div className='mt-8'>
            <div className='mb-3'>
                {profile?.is_subscribed
                ? `プラン契約中：${profile.interval}`
                : `プラン未加入`
                }
            </div>
            <SubscriptionManagementButton />
        </div>
    </div>
  )
}

export default DashboardPage;