import React from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { User } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

interface NavbarProps {
  /** Optional content rendered between the brand and the right-side actions. */
  leftContent?: React.ReactNode
}

export const Navbar: React.FC<NavbarProps> = ({ leftContent }) => {
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
          <Logo size={48} style={{ borderRadius: 'var(--radius-md)' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              QuoteForge <span style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 600, padding: '2px 6px', background: 'var(--cyan-light)', borderRadius: 4 }}>QMS</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Enterprise Pricing & Corridor Engine</div>
          </div>
        </Link>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {leftContent}
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
