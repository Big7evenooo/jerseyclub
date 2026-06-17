'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UploadTrackPage() {
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [genre, setGenre] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadTrack = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('You must be logged in')
      return
    }

    const userId = session.user.id

    // 1. Upload audio
    const audioExt = audioFile.name.split('.').pop()
    const audioPath = `${userId}/${crypto.randomUUID()}.${audioExt}`

    const { error: audioError } = await supabase.storage
      .from('tracks')
      .upload(audioPath, audioFile, { upsert: true })

    if (audioError) {
      alert(audioError.message)
      setLoading(false)
      return
    }

    const { data: audioUrlData } = supabase.storage
      .from('tracks')
      .getPublicUrl(audioPath)

    // 2. Upload cover (optional)
    let coverUrl = null

    if (coverFile) {
      const coverExt = coverFile.name.split('.').pop()
      const coverPath = `${userId}/cover-${crypto.randomUUID()}.${coverExt}`

      const { error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverPath, coverFile, { upsert: true })

      if (coverError) {
        alert(coverError.message)
        setLoading(false)
        return
      }

      const { data: coverUrlData } = supabase.storage
        .from('covers')
        .getPublicUrl(coverPath)

      coverUrl = coverUrlData.publicUrl
    }

    // 3. Insert track into DB 
      const { data: newTrack, error: insertError } = await supabase
        .from('tracks')
        .insert({
          user_id: userId,
          title,
          bpm: bpm ? Number(bpm) : null,
          genre,
          audio_url: audioUrlData.publicUrl,
          cover_url: coverUrl
        })
        .select()
        .single()
        
    setLoading(false)
      
    if (insertError) {
      alert(insertError.message)
    } else {
      // Redirect to the new track page
      window.location.href = `/track/${newTrack.id}`
    }
    
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload a Track</h1>

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

      <label>Audio File (MP3/WAV)</label>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files[0])}
      />

      <label>Cover Art (optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCoverFile(e.target.files[0])}
      />

      <button
        onClick={uploadTrack}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        {loading ? 'Uploading…' : 'Upload Track'}
      </button>
    </div>
  )
}
