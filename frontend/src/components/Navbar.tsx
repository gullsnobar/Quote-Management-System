import React from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { FileText, User, PlusCircle } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  onNewQuote?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onNewQuote }) => {
  const user = useAppSelector((state) => state.auth.user)

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

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
            <button onClick={onNewQuote} className="btn btn-primary btn-sm" data-cy="nav-create-quote">
              <PlusCircle size={15} />
              <span>Create Quote</span>
            </button>
          )}

          <ThemeToggle />

          {user && (
            <Link
              to="/profile"
              title="View Profile"
              aria-label="View Profile"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.25)'
              }}
            >
              {initials || <User size={16} />}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
