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

type Step = 'name' | 'password'

const RegisterPanel: React.FC = () => {
  const router = useRouter()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('name')

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name')
    } else if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
    } else {
      setError('')
      setStep('password')
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(email, password)
      await api.upsertUser({
        email,
        first_name: firstName,
        last_name: lastName,
        username: email.split('@')[0],
      })
      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center">
      <div className="max-w-[320px] w-full">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-[1.2]">
          <span className="block text-[var(--ink)]">Create your account</span>
          <span className="block text-[var(--muted)]">Start your AI assistant journey</span>
        </h1>

        {step === 'name' && (
          <>
            <div className="mt-[26px]">
              <GoogleButton />
            </div>

            <div className="mt-[14px]">
              <Divider />
            </div>
          </>
        )}

        {step === 'name' ? (
          <form onSubmit={handleNameSubmit} className="mt-[14px] space-y-[10px]">
            <div className="flex gap-[10px]">
              <TextInput
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (error) setError('')
                }}
                placeholder="First name"
                autoComplete="given-name"
                spellCheck={false}
              />
              <TextInput
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Last name"
                autoComplete="family-name"
                spellCheck={false}
              />
            </div>

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
              onClick={() => setStep('name')}
              className="text-[13px] text-[var(--ink)] underline underline-offset-2 mb-[10px] hover:opacity-70 transition-opacity"
            >
              {firstName} {lastName}
            </button>

            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Create a password"
              error={error}
              autoComplete="new-password"
              spellCheck={false}
              disabled={loading}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
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

export default RegisterPanel
