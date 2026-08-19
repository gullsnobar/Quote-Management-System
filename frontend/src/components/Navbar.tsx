import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FileText, LogOut, User, PlusCircle } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  onNewQuote?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onNewQuote }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--primary-glow)',
          }}>
            <FileText size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              QuoteForge <span style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 600, padding: '2px 6px', background: 'var(--cyan-light)', borderRadius: 4 }}>QMS</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Enterprise Pricing & Corridor Engine</div>
          </div>
        </Link>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onNewQuote && (
            <button onClick={onNewQuote} className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>Create Quote</span>
            </button>
          )}

          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px',
              background: 'var(--navbar-user-bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}>
                <User size={14} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                {user.fullName || user.email.split('@')[0]}
              </div>
            </div>
          )}

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            title="Log out"
            aria-label="Log out"
            style={{ padding: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
