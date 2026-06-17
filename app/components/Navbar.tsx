'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      }
    }

    load()
  }, [])

  return (
    <nav className="w-full flex justify-between p-4 border-b border-gray-200">
      <a href="/">Home</a>

      <div className="flex items-center gap-4">
        {!session && (
          <>
            <a href="/auth/login">Login</a>
            <a href="/auth/signup">Signup</a>
          </>
        )}

        {session && (
          <a href="/profile">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#ddd'
                }}
              />
            )}
          </a>
        )}
      </div>
    </nav>
  )
}
