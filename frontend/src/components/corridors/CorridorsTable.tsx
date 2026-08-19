import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Corridor } from '../../types/corridor'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface CorridorsTableProps {
  corridors: Corridor[]
  isLoading: boolean
}

const columnTemplate = '70px minmax(180px, 1.5fr) minmax(180px, 1.4fr) minmax(260px, 2.3fr) 90px 170px 150px 150px 150px 110px'

export const CorridorsTable: React.FC<CorridorsTableProps> = ({ corridors, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: corridors.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    overscan: 8,
  })

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

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div
        ref={scrollRef}
        style={{
          maxHeight: '720px',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: '1200px', width: '100%' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'grid',
              gridTemplateColumns: columnTemplate,
              background: 'var(--table-header-bg)',
              borderBottom: '2px solid var(--border-medium)',
              lineHeight: 1.2,
            }}
          >
            {[
              '# ID',
              'Region / Country',
              'Type & Service',
              'Receiving Partner & Payer',
              'Payout Ccy',
              'ATV (USD)',
              'Revenue ($)',
              'Cost ($)',
              'Margin ($)',
              'Margin %',
            ].map((header, index) => (
              <div
                key={header}
                style={{
                  padding: '14px 16px',
                  color: index === 6 ? 'var(--cyan)' : index === 7 ? 'var(--text-danger)' : 'var(--text-muted)',
                  fontWeight: index >= 6 ? 700 : 600,
                  background: index >= 6 ? (index === 6 ? 'rgba(6, 182, 212, 0.05)' : index === 7 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(99, 102, 241, 0.05)') : 'transparent',
                  textAlign: index >= 4 ? 'right' : 'left',
                }}
              >
                {header}
              </div>
            ))}
          </div>

          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {virtualRows.map((virtualRow) => {
              const c = corridors[virtualRow.index]
              const calc = c.calculations
              const isMarginPositive = calc ? calc.margin >= 0 : false
              const rowIndex = virtualRow.index

              return (
                <div
                  key={c.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'grid',
                    gridTemplateColumns: columnTemplate,
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--table-row-hover-bg)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)')
                  }
                >
                  <div style={{ padding: '12px 16px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {c.corridorId || c.id}
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.country}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.region}</div>
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                  </div>

                  <div style={{ padding: '12px 16px', minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.receivingPartner}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.payer}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {c.payoutCurrency}
                  </div>

                  <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    ${Number(c.atvUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--cyan)',
                    background: 'rgba(6, 182, 212, 0.02)',
                  }}>
                    ${calc ? calc.revenue.toFixed(2) : '-'}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--text-danger)',
                    background: 'rgba(239, 68, 68, 0.02)',
                  }}>
                    ${calc ? calc.cost.toFixed(2) : '-'}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)',
                    background: 'rgba(99, 102, 241, 0.02)',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {isMarginPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      ${calc ? calc.margin.toFixed(2) : '-'}
                    </span>
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)',
                    background: 'rgba(99, 102, 241, 0.02)',
                  }}>
                    {calc ? `${calc.marginPercent.toFixed(1)}%` : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
