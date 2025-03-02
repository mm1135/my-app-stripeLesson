"use client"

import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs'
import React from 'react'
import { Button } from '../ui/button'

const AuthClientButton = ({session}: {session: Session | null}) => {

    const supabase = createClientComponentClient()

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
        })
    }
    
  return (
    <Button onClick={handleSignIn}>
        サインイン
    </Button>
  )
}

export default AuthClientButton