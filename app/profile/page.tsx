'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/auth/login'
      } else {
        setSession(data.session)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (!session) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Profile</h1>

      <p><strong>Email:</strong> {session.user.email}</p>

      <a href="/profile/edit" style={{ display: 'block', marginTop: 20 }}>
  Edit Profile
</a>

      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  )
}
