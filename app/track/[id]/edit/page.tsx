'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditTrackPage({ params }) {
  const [track, setTrack] = useState(null)
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [genre, setGenre] = useState('')
  const [newAudio, setNewAudio] = useState(null)
  const [newCover, setNewCover] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTrack()
  }, [])

  const loadTrack = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', params.id)
      .single()

    setTrack(data)
    setTitle(data.title)
    setBpm(data.bpm || '')
    setGenre(data.genre || '')
    setLoading(false)
  }

  const saveChanges = async () => {
    setSaving(true)

    let audioUrl = track.audio_url
    let coverUrl = track.cover_url

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session.user.id

    // Upload new audio if provided
    if (newAudio) {
      const ext = newAudio.name.split('.').pop()
      const path = `${userId}/${crypto.randomUUID()}.${ext}`

      await supabase.storage
        .from('tracks')
        .upload(path, newAudio, { upsert: true })

      const { data: urlData } = supabase.storage
        .from('tracks')
        .getPublicUrl(path)

      audioUrl = urlData.publicUrl
    }

    // Upload new cover if provided
    if (newCover) {
      const ext = newCover.name.split('.').pop()
      const path = `${userId}/cover-${crypto.randomUUID()}.${ext}`

      await supabase.storage
        .from('covers')
        .upload(path, newCover, { upsert: true })

      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(path)

      coverUrl = urlData.publicUrl
    }

    // Update track
    await supabase
      .from('tracks')
      .update({
        title,
        bpm: bpm ? Number(bpm) : null,
        genre,
        audio_url: audioUrl,
        cover_url: coverUrl
      })
      .eq('id', params.id)

    setSaving(false)
    window.location.href = `/track/${params.id}`
  }

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Track</h1>

      <label>Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>BPM</label>
      <input
        type="number"
        value={bpm}
        onChange={(e) => setBpm(e.target.value)}
      />

      <label>Genre</label>
      <input
        type="text"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />

      <label>Replace Audio (optional)</label>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setNewAudio(e.target.files[0])}
      />

      <label>Replace Cover (optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewCover(e.target.files[0])}
      />

      <button
        onClick={saveChanges}
        disabled={saving}
        style={{ marginTop: 20 }}
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
