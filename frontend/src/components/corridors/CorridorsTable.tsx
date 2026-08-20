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
      <div className="glass-panel empty-state">
        <div className="loading-spinner" style={{ width: 48, height: 48 }} />
        <h4 className="empty-state-title">Loading corridors...</h4>
        <p className="empty-state-text">Fetching from backend with calculated pricing</p>
      </div>
    )
  }

  if (corridors.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <div className="empty-state-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
          <AlertCircle size={24} />
        </div>
        <h4 className="empty-state-title">No Matching Corridors</h4>
        <p className="empty-state-text">Try adjusting your filter criteria to see available routes.</p>
      </div>
    )
  }

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div className="glass-panel corridor-table-wrapper">
      <div
        ref={scrollRef}
        className="corridor-table-scroll"
        style={{ maxHeight: '720px' }}
      >
        <div style={{ minWidth: '1200px', width: '100%' }}>
          <div
            className="corridor-table-header"
            style={{ gridTemplateColumns: columnTemplate }}
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
                  padding: '12px 16px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
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
                  className="corridor-table-row"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: columnTemplate,
                    backgroundColor: rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                  }}
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
                      <span className="tx-badge">{c.transactionType}</span>
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
                  }}>
                    ${calc ? calc.revenue.toFixed(2) : '-'}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--text-danger)',
                  }}>
                    ${calc ? calc.cost.toFixed(2) : '-'}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)',
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
