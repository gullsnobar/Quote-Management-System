import React from 'react'
import type { Corridor } from '../../types/corridor'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface CorridorsTableProps {
  corridors: Corridor[]
  isLoading: boolean
}

export const CorridorsTable: React.FC<CorridorsTableProps> = ({ corridors, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <h4 style={{ fontSize: 16, fontWeight: 600 }}>Loading 3,000 Corridors & Calculations...</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Querying backend PostgreSQL with AC-5 & AC-6 engine</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (corridors.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--warning-light)',
          color: 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <AlertCircle size={24} />
        </div>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Matching Corridors</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your filter criteria to see available routes.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ maxHeight: '720px', overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{
              background: '#0b1120',
              borderBottom: '2px solid var(--border-medium)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, width: 70 }}># ID</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Region / Country</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type & Service</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Receiving Partner & Payer</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Payout Ccy</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ATV (USD)</th>
              <th style={{ padding: '14px 16px', color: 'var(--cyan)', fontWeight: 700, textAlign: 'right', background: 'rgba(6, 182, 212, 0.05)' }}>Revenue ($)</th>
              <th style={{ padding: '14px 16px', color: '#f87171', fontWeight: 700, textAlign: 'right', background: 'rgba(239, 68, 68, 0.05)' }}>Cost ($)</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', background: 'rgba(99, 102, 241, 0.05)' }}>Margin ($)</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', background: 'rgba(99, 102, 241, 0.05)' }}>Margin %</th>
            </tr>
          </thead>
          <tbody>
            {corridors.map((c, index) => {
              const calc = c.calculations
              const isMarginPositive = calc ? calc.margin >= 0 : false

              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.25)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.4)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.25)')
                  }
                >
                  {/* ID */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {c.corridorId || c.id}
                  </td>

                  {/* Region & Country */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.country}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.region}</div>
                  </td>

                  {/* Type & Service */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        padding: '2px 6px',
                        background: 'var(--purple-light)',
                        color: 'var(--purple)',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        {c.transactionType}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.service}</span>
                    </div>
                  </td>

                  {/* Partner & Payer */}
                  <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.receivingPartner}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.payer}
                    </div>
                  </td>

                  {/* Payout Currency */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {c.payoutCurrency}
                  </td>

                  {/* ATV USD */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    ${Number(c.atvUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Backend Calculated Revenue */}
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--cyan)',
                    background: 'rgba(6, 182, 212, 0.02)',
                  }}>
                    ${calc ? calc.revenue.toFixed(2) : '-'}
                  </td>

                  {/* Backend Calculated Cost */}
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: '#f87171',
                    background: 'rgba(239, 68, 68, 0.02)',
                  }}>
                    ${calc ? calc.cost.toFixed(2) : '-'}
                  </td>

                  {/* Backend Calculated Margin */}
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: isMarginPositive ? '#34d399' : '#f87171',
                    background: 'rgba(99, 102, 241, 0.02)',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {isMarginPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      ${calc ? calc.margin.toFixed(2) : '-'}
                    </span>
                  </td>

                  {/* Backend Calculated Margin % */}
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: isMarginPositive ? '#34d399' : '#f87171',
                    background: 'rgba(99, 102, 241, 0.02)',
                  }}>
                    {calc ? `${calc.marginPercent.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
