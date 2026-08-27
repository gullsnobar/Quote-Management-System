import React from 'react'
import logoSrc from '../../assets/qms-logo.svg'

/**
 * Props for the Logo component.
 */
export interface LogoProps {
  /** Pixel size of the logo mark (width = height). Defaults to 38. */
  size?: number
  /** Optional inline style overrides. */
  style?: React.CSSProperties
  /** Optional className. */
  className?: string
}

/**
 * Brand logo for QuoteForge QMS.
 *
 * Renders the qms-logo.svg mark — a stylized "Q" formed by two parallel
 * corridor arcs with a gradient stroke (blue → teal). Used in the navbar,
 * login/signup pages, and as the document favicon.
 */
export const Logo: React.FC<LogoProps> = ({ size = 38, style, className }) => {
  return (
    <img
      src={logoSrc}
      alt="QuoteForge QMS logo"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
