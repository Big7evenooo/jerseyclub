'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProtectedLayout({ children }) {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/auth/login'
      }
    })
  }, [])

  return <>{children}</>
}
