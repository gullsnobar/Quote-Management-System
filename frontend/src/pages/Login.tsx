import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'
import { FileText, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })
      login(response.token, response.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--primary-glow)',
            marginBottom: 16,
          }}>
            <FileText size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>Welcome to QuoteForge</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
            Sign in to manage enterprise quotes & 3,000 corridors
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: 32 }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 20,
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="var(--primary)" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="var(--primary)" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
