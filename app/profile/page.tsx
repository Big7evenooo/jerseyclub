'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Load session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/auth/login'
        return
      }

      setSession(session)

      // 2. Load profile row
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Loading…</p>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Profile</h1>

      {/* Avatar */}
      <div style={{ marginTop: 20 }}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: 20
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#ddd',
              marginBottom: 20
            }}
          />
        )}
      </div>

      {/* Email */}
      <p><strong>Email:</strong> {session.user.email}</p>

      {/* Username */}
      {profile?.username && (
        <p><strong>Username:</strong> {profile.username}</p>
      )}

      {/* Display Name */}
      {profile?.display_name && (
        <p><strong>Name:</strong> {profile.display_name}</p>
      )}

      {/* Bio */}
      {profile?.bio && (
        <p style={{ marginTop: 10 }}>{profile.bio}</p>
      )}

      {/* Edit Profile */}
      <a href="/profile/edit" style={{ display: 'block', marginTop: 20 }}>
        Edit Profile
      </a>

      {/* Logout */}
      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  )
}
