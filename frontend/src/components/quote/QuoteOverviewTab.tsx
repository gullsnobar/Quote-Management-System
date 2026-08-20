import React from 'react'
import type { Quote, QuoteStatus } from '../../types/quote'
import { StatusBadge } from '../StatusBadge'
import {
  Info,
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'

/**
 * Props for the QuoteOverviewTab component.
 *
 * This is a pure presentational component — all data is passed from
 * the parent. No server-state logic, no API calls, no effects.
 *
 * `attachedCorridorCount` is the live count of corridors attached to
 * the quote (used as a fallback when `quote.corridorCount` is stale).
 * The parent passes `quoteCorridors.length` for this value.
 */
export interface QuoteOverviewTabProps {
  /** The fully-loaded quote object with all financial fields. */
  quote: Quote
  /** Live count of attached corridors (fallback for quote.corridorCount). */
  attachedCorridorCount: number
}

/**
 * Renders the Overview tab: quote information cards and financial summary.
 *
 * All financial values (totalRevenue, totalCost, totalMargin, marginPercent,
 * monthlyRevenue, monthlyCost, monthlyMargin, tcv) are pre-calculated on the
 * backend by the QuoteCalculationService and arrive ready to display.
 * This component does NOT perform any calculations — it only formats
 * the existing values for display.
 *
 * Formatting preserved exactly from the original inline JSX:
 * - Currency values use `toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
 * - Margin percentage uses `toFixed(1)`
 * - Nullish coalescing (`?? 0`) guards against undefined/null financial fields
 * - Contract length display uses `quote.contractLength || 1` (falls back to 1)
 * - Corridor count uses `quote.corridorCount ?? attachedCorridorCount`
 * - Margin sign determines color (success green / danger red)
 */
export const QuoteOverviewTab: React.FC<QuoteOverviewTabProps> = ({
  quote,
  attachedCorridorCount,
}) => {
  const corridorCount = quote.corridorCount ?? attachedCorridorCount

  return (
    <section className="animate-fade-in">
      {/* Quote Information */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-header-icon"><Info size={18} /></div>
          <div>
            <div className="section-header-title">Quote Information</div>
            <div className="section-header-subtitle">Basic quote details and lifecycle</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="info-card">
            <div className="info-card-label">Quote ID</div>
            <div className="info-card-value" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>#{quote.id}</div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Commercial Partner</div>
            <div className="info-card-value">{quote.partnerName}</div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Status</div>
            <div style={{ marginTop: 6 }}><StatusBadge status={quote.status as QuoteStatus} /></div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Contract Length</div>
            <div className="info-card-value">{quote.contractLength || 1} Year{(quote.contractLength || 1) !== 1 ? 's' : ''}</div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Attached Corridors</div>
            <div className="info-card-value" style={{ color: 'var(--primary)' }}>{corridorCount}</div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Version</div>
            <div className="info-card-value" style={{ color: 'var(--text-muted)' }}>v{quote.version}</div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div className="section-header">
          <div className="section-header-icon"><Calculator size={18} /></div>
          <div>
            <div className="section-header-title">Financial Summary</div>
            <div className="section-header-subtitle">Calculated on backend from attached corridors</div>
          </div>
        </div>

        {/* Annual */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Annual
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
          <div className="fin-card" style={{ borderLeftColor: 'var(--cyan)' }} data-cy="total-revenue">
            <div className="fin-card-label"><DollarSign size={16} style={{ color: 'var(--cyan)' }} /> Total Revenue</div>
            <div className="fin-card-value" style={{ color: 'var(--cyan)' }}>
              ${(quote.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="fin-card-hint">Yearly corridor revenue</div>
          </div>
          <div className="fin-card" style={{ borderLeftColor: 'var(--text-danger)' }}>
            <div className="fin-card-label"><DollarSign size={16} style={{ color: 'var(--text-danger)' }} /> Total Cost</div>
            <div className="fin-card-value" style={{ color: 'var(--text-danger)' }}>
              ${(quote.totalCost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="fin-card-hint">Fixed + variable + FX</div>
          </div>
          <div className="fin-card" style={{ borderLeftColor: (quote.totalMargin ?? 0) >= 0 ? 'var(--text-success)' : 'var(--text-danger)' }}>
            <div className="fin-card-label">
              {(quote.totalMargin ?? 0) >= 0 ? <TrendingUp size={16} style={{ color: 'var(--text-success)' }} /> : <TrendingDown size={16} style={{ color: 'var(--text-danger)' }} />}
              Total Margin
            </div>
            <div className="fin-card-value" style={{ color: (quote.totalMargin ?? 0) >= 0 ? 'var(--text-success)' : 'var(--text-danger)' }}>
              ${(quote.totalMargin ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="fin-card-hint">Revenue minus cost</div>
          </div>
          <div className="fin-card" style={{ borderLeftColor: (quote.marginPercent ?? 0) >= 0 ? 'var(--text-success)' : 'var(--text-danger)' }}>
            <div className="fin-card-label"><Calculator size={16} style={{ color: 'var(--primary)' }} /> Margin %</div>
            <div className="fin-card-value" style={{ color: (quote.marginPercent ?? 0) >= 0 ? 'var(--text-success)' : 'var(--text-danger)' }}>
              {(quote.marginPercent ?? 0).toFixed(1)}%
            </div>
            <div className="fin-card-hint">Margin / revenue</div>
          </div>
        </div>

        {/* Monthly */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Monthly
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="info-card" data-cy="monthly-revenue">
            <div className="info-card-label">Monthly Revenue</div>
            <div className="info-card-value" style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
              ${(quote.monthlyRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Monthly Cost</div>
            <div className="info-card-value" style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: 'var(--text-danger)' }}>
              ${(quote.monthlyCost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-label">Monthly Margin</div>
            <div className="info-card-value" style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: (quote.monthlyMargin ?? 0) >= 0 ? 'var(--text-success)' : 'var(--text-danger)' }}>
              ${(quote.monthlyMargin ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* TCV */}
        <div
          data-cy="tcv"
          style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', background: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)',
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Contract Value (TCV)</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
              Revenue × {quote.contractLength || 1} year{(quote.contractLength || 1) !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
            ${(quote.tcv ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* No corridors notice */}
        {corridorCount === 0 && (
          <div className="notification-banner" style={{ marginTop: 20, background: 'var(--warning-light)', border: '1px solid var(--warning-border)', color: 'var(--text-warning)' }}>
            <AlertTriangle size={18} />
            <span>No corridors attached. Go to the Corridors tab to attach routes and see pricing.</span>
          </div>
        )}
      </div>
    </section>
  )
}
