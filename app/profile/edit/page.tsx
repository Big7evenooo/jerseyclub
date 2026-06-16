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
  const [avatarFile, setAvatarFile] = useState(null)

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

  const uploadAvatar = async () => {
    if (!avatarFile) return

    const { data: { session } } = await supabase.auth.getSession()
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${session.user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true })

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setProfile({ ...profile, avatar_url: urlData.publicUrl })
  }

  const updateProfile = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    const updates = {
      id: session.user.id,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
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

      {profile.avatar_url && (
        <img
          src={profile.avatar_url}
          alt="Avatar"
          style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 20 }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files[0])}
      />

      <button onClick={uploadAvatar} style={{ marginTop: 10 }}>
        Upload Avatar
      </button>

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
