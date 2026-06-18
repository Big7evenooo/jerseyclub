'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TrackPage({ params }) {
  const [track, setTrack] = useState(null)
  const [uploader, setUploader] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  
  useEffect(() => {
    loadTrack()
  }, [])

  const loadComments = async () => 
    const { data } = await supabase
    .from('comments')
    .select(`
      id,
      text,
      created_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('track_id', params.id)
    .order('created_at', { ascending: true })

  setComments(data || [])
}
  
  const loadTrack = async () => {
    // 1. Load track
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!trackData) {
      setLoading(false)
      return
    }

    setTrack(trackData)

    // 2. Load uploader profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', trackData.user_id)
      .single()

    setUploader(profileData)
    setLoading(false)
  }

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>
  if (!track) return <p style={{ padding: 20 }}>Track not found</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>{track.title}</h1>

      {/* Cover Art */}
      {track.cover_url && (
        <img
          src={track.cover_url}
          alt="Cover"
          style={{
            width: 250,
            height: 250,
            objectFit: 'cover',
            borderRadius: 12,
            marginBottom: 20
          }}
        />
      )}

      {/* Audio Player */}
      <audio
        controls
        src={track.audio_url}
        style={{ width: '100%', marginBottom: 20 }}
      />

      {/* Uploader Info */}
      {uploader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {uploader.avatar_url ? (
            <img
              src={uploader.avatar_url}
              alt="Avatar"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#ddd'
              }}
            />
          )}

          <div>
            <strong>{uploader.username}</strong>
            <p style={{ margin: 0, color: '#666' }}>Uploaded this track</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div style={{ marginTop: 20 }}>
        {track.genre && <p><strong>Genre:</strong> {track.genre}</p>}
        {track.bpm && <p><strong>BPM:</strong> {track.bpm}</p>}
      </div>

      {/* Comments Section Placeholder */}
      <div style={{ marginTop: 40 }}>
        <h2>Comments</h2>
        <p>Comments will appear here.</p>
      </div>

      {/* Likes Section Placeholder */}
      <div style={{ marginTop: 20 }}>
        <h2>Likes</h2>
        <p>Likes will appear here.</p>
      </div>
    </div>
  )
}
