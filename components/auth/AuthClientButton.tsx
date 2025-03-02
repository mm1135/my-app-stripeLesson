"use client"

import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
const AuthClientButton = ({session}: {session: Session | null}) => {

    const supabase = createClientComponentClient()

    const router = useRouter()

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${location.origin}/auth/callback`
            }
        })

    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

  return (
    <>
        {session ? (
            <Button onClick={handleSignOut}>
                ログアウト
            </Button>
        ) : (
            <Button onClick={handleSignIn}>
                サインイン
            </Button>
        )}
    </>

  )
}

export default AuthClientButton