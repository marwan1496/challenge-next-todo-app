'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from 'lucide-react'

interface UserSetupProps {
  onUserSetup: (user: { email: string; name: string }) => void
}

export default function UserSetup({ onUserSetup }: UserSetupProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name) return

    setIsLoading(true)
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        // User exists, update name if different
        if (existingUser.name !== name) {
          await supabase
            .from('users')
            .update({ name })
            .eq('email', email)
        }
      } else {
        // Create new user
        await supabase
          .from('users')
          .insert([{ email, name }])
      }

      onUserSetup({ email, name })
    } catch (error) {
      console.error('Error setting up user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">
            Welcome to Pomofocus Todo
          </h1>
          <p className="text-gray-600">
            Get started by entering your details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !name}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Get Started'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This information helps us personalize your experience and save your tasks.
          </p>
        </div>
      </div>
    </div>
  )
}
