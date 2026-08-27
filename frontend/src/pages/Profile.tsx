import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../features/auth/authSlice'
import { quotesApi } from '../api/quotesApi'
import { Navbar } from '../components/Navbar'
import { ConfirmDialog } from '../components/ConfirmDialog'
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
  Shield,
  Activity,
  TrendingUp,
  Hash,
} from 'lucide-react'

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [now] = useState(() => new Date())

  useEffect(() => {
    quotesApi
      .getQuotes()
      .then((res) => setQuotes(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false)
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

  const approvalRate = stats.total > 0
    ? Math.round((stats.approved / stats.total) * 100)
    : 0

  const initials = (user.fullName || user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const memberSinceShort = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  // Days since account created
  const daysActive = user.createdAt
    ? Math.max(1, Math.floor((now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const statCards = [
    { label: 'Total Quotes', value: stats.total, icon: FileText, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Drafts', value: stats.draft, icon: FileEdit, color: 'var(--warning)', bg: 'var(--warning-light)' },
    { label: 'In Review', value: stats.in_review, icon: Clock, color: 'var(--purple)', bg: 'var(--purple-light)' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'var(--text-success)', bg: 'var(--success-light)' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'var(--text-danger)', bg: 'var(--danger-light)' },
  ]

  const accountFields = [
    { label: 'Full Name', value: user.fullName || 'Not set', icon: UserIcon },
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Member Since', value: memberSince, icon: Calendar },
    { label: 'User ID', value: `#${user.id}`, icon: Hash, mono: true },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <Navbar />

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link
          to="/"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* ============ Hero Banner ============ */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 20,
            borderRadius: 'var(--radius-xl)',
          }}
        >
          {/* Gradient backdrop */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Decorative glow orbs */}
          <div style={{
            position: 'absolute',
            top: -40, right: -20,
            width: 180, height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -60, left: 100,
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* Avatar with ring */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  opacity: 0.6,
                  filter: 'blur(8px)',
                }} />
                <div style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#ffffff',
                  position: 'relative',
                  border: '3px solid var(--bg-surface)',
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35)',
                }}>
                  {initials}
                </div>
              </div>

              {/* Name & meta */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>
                  {user.fullName || 'User'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />
                    <span>Joined {memberSinceShort}</span>
                  </span>
                </div>

                {/* Quick pills */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <Shield size={11} />
                    <span>Active Member</span>
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--cyan-light)', color: 'var(--text-cyan)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <Activity size={11} />
                    <span>{daysActive} Day{daysActive !== 1 ? 's' : ''} Active</span>
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--success-light)', color: 'var(--text-success)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <TrendingUp size={11} />
                    <span>{approvalRate}% Approval Rate</span>
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
                data-cy="logout-button"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============ Two-column layout ============ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(380px, 1.6fr)',
          gap: 20,
          alignItems: 'start',
        }}>
          {/* ---- Left column: Account Details ---- */}
          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 800,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}>
              <UserIcon size={16} color="var(--primary)" />
              <span>Account Details</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {accountFields.map((field, idx) => {
                const Icon = field.icon
                return (
                  <div
                    key={field.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom: idx < accountFields.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={15} color="var(--text-muted)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 2 }}>
                        {field.label}
                      </div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        wordBreak: 'break-all',
                        fontFamily: field.mono ? 'var(--font-mono)' : 'inherit',
                      }}>
                        {field.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Link
              to="/"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}
            >
              <Building2 size={14} />
              <span>Go to Dashboard</span>
            </Link>
          </div>

          {/* ---- Right column: Quote Statistics ---- */}
          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}>
                <FileText size={16} color="var(--primary)" />
                <span>Quote Statistics</span>
              </h3>
              {!isLoading && stats.total > 0 && (
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  fontWeight: 600,
                }}>
                  {approvalRate}% approval
                </span>
              )}
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
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
                {/* Stat cards grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 12,
                }}>
                  {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="glass-card"
                        style={{
                          padding: 18,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div style={{
                          width: 40, height: 40,
                          borderRadius: 'var(--radius-md)',
                          background: stat.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size={20} style={{ color: stat.color }} />
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {stat.label}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Distribution bar */}
                {stats.total > 0 && (
                  <div style={{ marginTop: 22 }}>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 600,
                      marginBottom: 10,
                    }}>
                      Status Distribution
                    </div>
                    <div style={{
                      display: 'flex',
                      height: 10,
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      {[
                        { count: stats.draft, color: 'var(--warning)' },
                        { count: stats.in_review, color: 'var(--purple)' },
                        { count: stats.approved, color: 'var(--success)' },
                        { count: stats.rejected, color: 'var(--danger)' },
                      ].filter((seg) => seg.count > 0).map((seg, i) => (
                        <div
                          key={i}
                          style={{
                            width: `${(seg.count / stats.total) * 100}%`,
                            background: seg.color,
                            transition: 'width 0.4s ease',
                          }}
                          title={`${seg.count} quotes`}
                        />
                      ))}
                    </div>
                    {/* Legend */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px 16px',
                      marginTop: 12,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}>
                      {[
                        { label: 'Draft', count: stats.draft, color: 'var(--warning)' },
                        { label: 'In Review', count: stats.in_review, color: 'var(--purple)' },
                        { label: 'Approved', count: stats.approved, color: 'var(--success)' },
                        { label: 'Rejected', count: stats.rejected, color: 'var(--danger)' },
                      ].map((item) => (
                        <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            width: 8, height: 8,
                            borderRadius: '50%',
                            background: item.color,
                            flexShrink: 0,
                          }} />
                          <span>{item.label} ({item.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stats.total === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '28px 20px',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}>
                    <FileText size={32} style={{ color: 'var(--text-dim)', marginBottom: 10 }} />
                    <div>No quotes yet. Start by creating one from the dashboard.</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={isLogoutConfirmOpen}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  )
}
