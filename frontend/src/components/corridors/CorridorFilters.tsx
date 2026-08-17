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
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Filter size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Corridor Filters (AC-4)</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Filtering backend dataset in PostgreSQL
            </div>
          </div>
        </div>

        {/* Result & Active Filter Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            {isLoading ? (
              <span style={{ color: 'var(--text-dim)' }}>Loading...</span>
            ) : (
              <span>
                Showing <strong style={{ color: 'var(--cyan)' }}>{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} Corridors
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {/* 1. Region */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Globe size={13} color="var(--primary)" />
            <span>Region</span>
          </label>
          <select
            className="form-select"
            value={filters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
          >
            <option value="">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Africa">Africa</option>
            <option value="Asia">Asia</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
          </select>
        </div>

        {/* 2. Country */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={13} color="var(--cyan)" />
            <span>Country</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Denmark, Nigeria"
            value={filters.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>

        {/* 3. Transaction Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={13} color="var(--purple)" />
            <span>Transaction Type</span>
          </label>
          <select
            className="form-select"
            value={filters.transactionType || ''}
            onChange={(e) => handleChange('transactionType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
            <option value="C2C">C2C</option>
          </select>
        </div>

        {/* 4. Service */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={13} color="var(--warning)" />
            <span>Service</span>
          </label>
          <select
            className="form-select"
            value={filters.service || ''}
            onChange={(e) => handleChange('service', e.target.value)}
          >
            <option value="">All Services</option>
            <option value="BankAccount">Bank Account</option>
            <option value="Card">Card</option>
            <option value="CashPickup">Cash Pickup</option>
            <option value="MobileWallet">Mobile Wallet</option>
          </select>
        </div>

        {/* 5. Payout Currency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DollarSign size={13} color="var(--success)" />
            <span>Currency</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. EUR, USD, KES"
            value={filters.payoutCurrency || ''}
            onChange={(e) => handleChange('payoutCurrency', e.target.value)}
          />
        </div>

        {/* 6. Receiving Partner */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={13} color="var(--info)" />
            <span>Receiving Partner</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Search partner..."
            value={filters.receivingPartner || ''}
            onChange={(e) => handleChange('receivingPartner', e.target.value)}
          />
        </div>

        {/* 7. Payer */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={13} color="var(--text-muted)" />
            <span>Payer</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Search payer..."
            value={filters.payer || ''}
            onChange={(e) => handleChange('payer', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
