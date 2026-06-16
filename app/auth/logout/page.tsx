'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LogoutPage() {
  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    }
    doLogout()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <p>Logging out…</p>
    </div>
  )
}
