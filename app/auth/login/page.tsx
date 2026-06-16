'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (error) setError(error.message)
    else window.location.href = '/'
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading…' : 'Login'}
      </button>

      <button
  onClick={() =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }
>
  Continue with Google
</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
