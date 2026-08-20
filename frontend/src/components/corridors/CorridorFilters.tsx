import React from 'react'
import type { CorridorFilters as FiltersType } from '../../types/corridor'
import { Filter, RotateCcw, Search, Globe, DollarSign, Building2, Layers } from 'lucide-react'

interface CorridorFiltersProps {
  filters: FiltersType
  onChange: (newFilters: FiltersType) => void
  onClear: () => void
  totalCount: number
  filteredCount: number
  isLoading: boolean
}

// Real distinct values from the database (3,000 corridors)
const REGIONS = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada',
  'Chile', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
  'Ghana', 'India', 'Indonesia', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
  'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Philippines',
  'Poland', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
  'Thailand', 'UK', 'USA', 'Vietnam',
]

const SERVICES = ['BankAccount', 'Card', 'CashPickup', 'MobileWallet']

const SERVICE_LABELS: Record<string, string> = {
  BankAccount: 'Bank Account',
  Card: 'Card',
  CashPickup: 'Cash Pickup',
  MobileWallet: 'Mobile Wallet',
}

const CURRENCIES = [
  'ARS', 'AUD', 'BDT', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'DKK',
  'EGP', 'EUR', 'GBP', 'GHS', 'IDR', 'INR', 'JPY', 'KES', 'KRW', 'MAD',
  'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'PEN', 'PHP', 'PLN', 'SEK', 'SGD',
  'THB', 'USD', 'VND', 'ZAR',
]

const TX_TYPES = ['B2B', 'B2C', 'C2C']

const PARTNERS = [
  'Banking Circle S.A.',
  'Clearing House Co.',
  'Digital Wallet Platform',
  'Global Remittance Partner',
  'Local Bank Network',
  'Payment Network Ltd.',
  'Regional Mobile Money Provider',
  'Thunes Business Hub',
]

export const CorridorFilters: React.FC<CorridorFiltersProps> = ({
  filters,
  onChange,
  onClear,
  totalCount,
  filteredCount,
  isLoading,
}) => {
  const handleChange = (key: keyof FiltersType, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-header-icon"><Filter size={18} /></div>
          <div>
            <div className="section-header-title">Filters</div>
            <div className="section-header-subtitle" data-cy="corridor-filter-summary">
              {isLoading ? 'Loading...' : (
                <>Showing <strong style={{ color: 'var(--cyan)' }}>{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} corridors</>
              )}
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button onClick={onClear} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCcw size={14} />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Filter Row 1: Dropdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 12,
        marginBottom: 12,
      }}>
        {/* Region */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Globe size={13} color="var(--primary)" />
            <span>Region</span>
          </label>
          <select
            className="form-select"
            value={filters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
            data-cy="filter-region"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Globe size={13} color="var(--cyan)" />
            <span>Country</span>
          </label>
          <select
            className="form-select"
            value={filters.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Layers size={13} color="var(--purple)" />
            <span>Transaction Type</span>
          </label>
          <select
            className="form-select"
            value={filters.transactionType || ''}
            onChange={(e) => handleChange('transactionType', e.target.value)}
          >
            <option value="">All Types</option>
            {TX_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Layers size={13} color="var(--warning)" />
            <span>Service</span>
          </label>
          <select
            className="form-select"
            value={filters.service || ''}
            onChange={(e) => handleChange('service', e.target.value)}
          >
            <option value="">All Services</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{SERVICE_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Payout Currency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <DollarSign size={13} color="var(--success)" />
            <span>Payout Currency</span>
          </label>
          <select
            className="form-select"
            value={filters.payoutCurrency || ''}
            onChange={(e) => handleChange('payoutCurrency', e.target.value)}
          >
            <option value="">All Currencies</option>
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* Receiving Partner */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Building2 size={13} color="var(--info)" />
            <span>Receiving Partner</span>
          </label>
          <select
            className="form-select"
            value={filters.receivingPartner || ''}
            onChange={(e) => handleChange('receivingPartner', e.target.value)}
          >
            <option value="">All Partners</option>
            {PARTNERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Row 2: Payer text search */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 12,
      }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Search size={13} color="var(--text-muted)" />
            <span>Payer (text search)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by payer name (partial match)..."
            value={filters.payer || ''}
            onChange={(e) => handleChange('payer', e.target.value)}
            data-cy="filter-payer-search"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null
            const label = key === 'payoutCurrency' ? 'Currency'
              : key === 'transactionType' ? 'Tx Type'
              : key === 'receivingPartner' ? 'Partner'
              : key.charAt(0).toUpperCase() + key.slice(1)
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
              >
                <span>{label}: {value}</span>
                <button
                  onClick={() => handleChange(key as keyof FiltersType, '')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={`Remove ${label} filter`}
                >
                  <RotateCcw size={11} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
