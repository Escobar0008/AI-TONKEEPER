'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
const [showPassword, setShowPassword] = useState(false);
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('🎉 Account created! Check your email to confirm your account.')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-blue-200 text-center mb-8">
          Join AI TONKEEPER today
        </p>

        <form onSubmit={handleSignUp} className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none"
          />

      <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full p-4 pr-14 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-bold text-white disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center text-blue-200 mt-8">
          Already have an account?{' '}
          <a href="/signin" className="text-white font-semibold">
            Sign In
          </a>
        </p>

      </div>
    </main>
  )
}