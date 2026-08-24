import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../features/auth/authSlice'
import { quotesApi } from '../api/quotesApi'
import { Navbar } from '../components/Navbar'
import type { Quote } from '../types/quote'
import {
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  LogOut,
  User as UserIcon,
  Building2,
} from 'lucide-react'

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    quotesApi
      .getQuotes()
      .then((res) => setQuotes(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return
    await dispatch(logoutUser())
    navigate('/login')
  }

  if (!user) return null

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    in_review: quotes.filter((q) => q.status === 'in_review').length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
  }

  const initials = (user.fullName || user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link
          to="/"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Profile Header Card */}
        <div className="glass-panel" style={{ padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}>
              {initials}
            </div>

            {/* Name & Email */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                {user.fullName || 'User'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14 }}>
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12, marginTop: 6 }}>
                <Calendar size={12} />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              data-cy="logout-button"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="glass-panel" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserIcon size={18} color="var(--primary)" />
            Account Details
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}>
            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserIcon size={13} />
                <span>Full Name</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 6 }}>
                {user.fullName || 'Not set'}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} />
                <span>Email Address</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 6, wordBreak: 'break-all' }}>
                {user.email}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} />
                <span>Account Created</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 6 }}>
                {memberSince}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} />
                <span>User ID</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                #{user.id}
              </div>
            </div>
          </div>
        </div>

        {/* Quote Statistics */}
        <div className="glass-panel" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--primary)" />
            Quote Statistics
          </h3>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '3px solid var(--border-medium)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 14,
              }}>
                <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <FileText size={22} style={{ color: 'var(--primary)', marginBottom: 8 }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{stats.total}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Quotes</div>
                </div>

                <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <FileEdit size={22} style={{ color: 'var(--warning)', marginBottom: 8 }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{stats.draft}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Drafts</div>
                </div>

                <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <Clock size={22} style={{ color: 'var(--purple)', marginBottom: 8 }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--purple)' }}>{stats.in_review}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>In Review</div>
                </div>

                <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <CheckCircle2 size={22} style={{ color: 'var(--text-success)', marginBottom: 8 }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-success)' }}>{stats.approved}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Approved</div>
                </div>

                <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <XCircle size={22} style={{ color: 'var(--text-danger)', marginBottom: 8 }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-danger)' }}>{stats.rejected}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rejected</div>
                </div>
              </div>

              <Link
                to="/"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Building2 size={14} />
                <span>Go to Dashboard</span>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
