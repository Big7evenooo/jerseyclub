'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/auth/login'
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [])

  const updateProfile = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    const updates = {
      id: session.user.id,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      updated_at: new Date()
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id)

    setLoading(false)

    if (error) alert(error.message)
    else alert('Profile updated!')
  }

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Profile</h1>

      <label>Username</label>
      <input
        type="text"
        value={profile.username || ''}
        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
      />

      <label>Display Name</label>
      <input
        type="text"
        value={profile.display_name || ''}
        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
      />

      <label>Bio</label>
      <textarea
        value={profile.bio || ''}
        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
      />

      <button onClick={updateProfile} style={{ marginTop: 20 }}>
        Save Changes
      </button>
    </div>
  )
}
