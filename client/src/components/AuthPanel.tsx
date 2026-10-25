'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import GoogleButton from './GoogleButton'
import Divider from './Divider'
import TextInput from './TextInput'
import Button from './Button'
import LegalText from './LegalText'
import { isValidEmail } from '@/lib/validation'

type Step = 'email' | 'password'

const AuthPanel: React.FC = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('email')

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
    } else {
      setError('')
      setStep('password')
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length === 0) {
      setError('Please enter your password')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      await api.upsertUser({ email })
      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center">
      <div className="max-w-[320px] w-full">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-[1.2]">
          <span className="block text-[var(--ink)]">Welcome to Sana AI</span>
          <span className="block text-[var(--muted)]">Your AI assistant for work</span>
        </h1>

        {step === 'email' && (
          <>
            <div className="mt-[26px]">
              <GoogleButton />
            </div>

            <div className="mt-[14px]">
              <Divider />
            </div>
          </>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="mt-[14px] space-y-[10px]">
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="janesmith1@gmail.com"
              error={error}
              autoComplete="email"
              spellCheck={false}
            />

            <Button type="submit" variant="primary" className="w-full">
              Continue with email
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-[14px] space-y-[10px]">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-[13px] text-[var(--ink)] underline underline-offset-2 mb-[10px] hover:opacity-70 transition-opacity"
            >
              {email}
            </button>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Enter your password"
              error={error}
              autoComplete="current-password"
              spellCheck={false}
              disabled={loading}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        )}

        <div className="mt-[18px]">
          <LegalText />
        </div>
      </div>
    </div>
  )
}

export default AuthPanel
