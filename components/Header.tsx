import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import AuthServerButton from './auth/AuthServerButton'

function Header() {
    return (
        <div className="flex py-4 px-6 border-b border-gray-200">
            <Link href="/">
                <Button variant="outline">
                ホーム
                </Button>
            </Link>
            <Link href="/pricing" className='ml-4'>
                <Button variant="outline">
                価格
                </Button>
            </Link>

            <div className='ml-auto'>
                <AuthServerButton />
            </div>
        </div>
    )
}

export default Header