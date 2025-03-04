"use client"

import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation';

function SubscriptionManagementButton() {

    const router = useRouter();

    const loadPortal = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/portal`);
        const data = await response.json();

        router.push(data.url);
    }
  return (
    <div>
        <Button onClick={loadPortal}>サブスクリプション管理</Button>

    </div>
  )
}

export default SubscriptionManagementButton