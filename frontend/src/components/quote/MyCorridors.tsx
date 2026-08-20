import React, { useState } from 'react'
import type { Corridor } from '../../types/corridor'
import { Layers, Plus, Trash2, TrendingUp, TrendingDown, Pencil, Check, X, RotateCcw } from 'lucide-react'

/**
 * Props for the MyCorridors component.
 *
 * This is a pure presentational component — all state and handlers
 * are passed from the parent (QuoteCorridorsTab). No API calls,
 * no effects, no mutations.
 */
export interface MyCorridorsProps {
  /** Corridors currently attached to the quote. */
  corridors: Corridor[]
  /** Whether the attached-corridors list is loading. */
  isLoading: boolean
  /** Whether the quote can be edited (status is draft or rejected). */
  isEditable: boolean
  /** Set of corridor IDs currently selected for bulk operations. */
  selectedIds: Set<number>
  /** Toggle selection of a single corridor. */
  onToggleSelection: (corridorId: number) => void
  /** Select or deselect all attached corridors. */
  onSelectAll: () => void
  /** Clear all selections. */
  onClearSelection: () => void
  /** Detach a single corridor from the quote. */
  onDetach: (corridorId: number) => void
  /** Bulk detach all selected corridors. */
  onBulkDetach: () => void
  /** Set of corridor IDs currently being detached (per-row loading). */
  detachingIds: Set<number>
  /** Whether a bulk detach operation is in progress. */
  isBulkDetaching: boolean
  /** Switch to the Browse Catalog sub-tab. */
  onBrowseCatalog: () => void
  /** Update the negotiated fee for a corridor on this quote. */
  onUpdateNegotiatedFee: (corridorId: number, negotiatedFee: number | null) => Promise<void>
  /** Set of corridor IDs currently being updated (per-row loading). */
  updatingFeeIds: Set<number>
}

const COLUMN_TEMPLATE = '40px 70px minmax(160px,1.4fr) minmax(160px,1.3fr) minmax(240px,2fr) 80px 90px 110px 110px 150px 130px 130px 100px 60px'

const HEADERS = ['# ID', 'Region / Country', 'Type & Service', 'Receiving Partner & Payer', 'Ccy', 'ATV (USD)', 'Std Fee', 'Neg. Fee', 'Revenue ($)', 'Cost ($)', 'Margin ($)', 'Margin %', '', '']

/**
 * Renders the "My Corridors" sub-tab: corridors attached to the quote
 * with per-row detach, bulk detach, and inline negotiated fee editing.
 */
export const MyCorridors: React.FC<MyCorridorsProps> = ({
  corridors,
  isLoading,
  isEditable,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onDetach,
  onBulkDetach,
  detachingIds,
  isBulkDetaching,
  onBrowseCatalog,
  onUpdateNegotiatedFee,
  updatingFeeIds,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const startEdit = (corridor: Corridor) => {
    setEditingId(corridor.id)
    setEditValue(
      corridor.negotiatedFee !== null && corridor.negotiatedFee !== undefined
        ? String(corridor.negotiatedFee)
        : ''
    )
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setEditError(null)
  }

  const saveEdit = async (corridorId: number) => {
    const trimmed = editValue.trim()

    // Empty value = clear override (reset to standard)
    if (trimmed === '') {
      setEditError(null)
      try {
        await onUpdateNegotiatedFee(corridorId, null)
        setEditingId(null)
      } catch {
        setEditError('Failed to save')
      }
      return
    }

    const parsed = parseFloat(trimmed)
    if (isNaN(parsed) || parsed < 0) {
      setEditError('Must be ≥ 0')
      return
    }

    setEditError(null)
    try {
      await onUpdateNegotiatedFee(corridorId, parsed)
      setEditingId(null)
    } catch {
      setEditError('Failed to save')
    }
  }

  const resetOverride = async (corridorId: number) => {
    try {
      await onUpdateNegotiatedFee(corridorId, null)
    } catch {
      // parent handles error notification
    }
  }

  if (isLoading) {
    return (
      <div className="glass-panel empty-state">
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading attached corridors...</p>
      </div>
    )
  }

  if (corridors.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <div className="empty-state-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <Layers size={24} />
        </div>
        <h4 className="empty-state-title">No Corridors Attached</h4>
        <p className="empty-state-text">
          {isEditable
            ? 'Browse the catalog and attach corridors to calculate pricing.'
            : 'This quote has no corridors attached.'}
        </p>
        {isEditable && (
          <button onClick={onBrowseCatalog} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Browse Catalog</span>
          </button>
        )}
      </div>
    )
  }

  const allSelected = corridors.length > 0 && corridors.every((qc) => selectedIds.has(qc.id))

  return (
    <div className="glass-panel corridor-table-wrapper">
      {/* Table header bar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{corridors.length} Corridor{corridors.length !== 1 ? 's' : ''} Attached</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Pricing calculated on backend</span>
        </div>
        {isEditable && selectedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedIds.size} selected</span>
            <button onClick={onBulkDetach} disabled={isBulkDetaching} className="btn btn-danger btn-sm" data-cy="bulk-detach">
              <Trash2 size={14} />
              <span>{isBulkDetaching ? 'Removing...' : `Remove ${selectedIds.size}`}</span>
            </button>
            <button onClick={onClearSelection} className="btn btn-secondary btn-sm">
              Clear
            </button>
          </div>
        )}
      </div>
      {/* Table */}
      <div className="corridor-table-scroll">
        <div style={{ minWidth: '1500px', width: '100%' }}>
          <div className="corridor-table-header" style={{ gridTemplateColumns: COLUMN_TEMPLATE }}>
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
              {isEditable && (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                  data-cy="select-all-corridors"
                />
              )}
            </div>
            {HEADERS.map((header, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  textAlign: index >= 5 && index <= 11 ? 'right' : 'left',
                }}
              >
                {header}
              </div>
            ))}
          </div>
          {corridors.map((c, rowIndex) => {
            const calc = c.calculations
            const isMarginPositive = calc ? calc.margin >= 0 : false
            const isSelected = selectedIds.has(c.id)
            const isEditing = editingId === c.id
            const isUpdating = updatingFeeIds.has(c.id)
            const hasOverride = c.negotiatedFee !== null && c.negotiatedFee !== undefined
            return (
              <div
                key={c.id}
                className={`corridor-table-row ${isSelected ? 'corridor-table-row-selected' : ''}`}
                data-cy="corridor-row"
                data-cy-corridor-id={c.id}
                style={{
                  gridTemplateColumns: COLUMN_TEMPLATE,
                  backgroundColor: isSelected ? 'var(--primary-light)' : rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                }}
              >
                <div style={{ padding: '12px 12px', display: 'flex', alignItems: 'center' }}>
                  {isEditable && (
                    <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(c.id)} style={{ cursor: 'pointer', width: 16, height: 16 }} data-cy="corridor-checkbox" />
                  )}
                </div>
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
                {/* Standard Fee */}
                <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                  ${Number(c.stdFixedFeeUsd).toFixed(2)}
                </div>
                {/* Negotiated Fee — inline editable */}
                <div style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  {isEditable && isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(c.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          placeholder="—"
                          className="form-input"
                          style={{ width: 80, padding: '4px 8px', fontSize: 12, textAlign: 'right' }}
                        />
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={isUpdating}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Save"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      {editError && (
                        <span style={{ fontSize: 10, color: 'var(--text-danger)' }}>{editError}</span>
                      )}
                    </div>
                  ) : isEditable ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: hasOverride ? 'var(--primary)' : 'var(--text-dim)',
                          cursor: 'pointer',
                        }}
                        onClick={() => !isUpdating && startEdit(c)}
                        title={hasOverride ? 'Click to edit negotiated fee' : 'Click to set negotiated fee'}
                      >
                        {hasOverride ? `$${Number(c.negotiatedFee).toFixed(2)}` : '—'}
                      </span>
                      <button
                        onClick={() => startEdit(c)}
                        disabled={isUpdating}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 5px', opacity: 0.7 }}
                        title="Edit negotiated fee"
                      >
                        <Pencil size={10} />
                      </button>
                      {hasOverride && (
                        <button
                          onClick={() => resetOverride(c.id)}
                          disabled={isUpdating}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 5px', opacity: 0.7 }}
                          title="Reset to standard fee"
                        >
                          <RotateCcw size={10} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontWeight: 700, color: hasOverride ? 'var(--primary)' : 'var(--text-dim)' }}>
                      {hasOverride ? `$${Number(c.negotiatedFee).toFixed(2)}` : '—'}
                    </span>
                  )}
                </div>
                {/* Revenue */}
                <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                  ${calc ? calc.revenue.toFixed(2) : '-'}
                </div>
                {/* Cost */}
                <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-danger)' }}>
                  ${calc ? calc.cost.toFixed(2) : '-'}
                </div>
                {/* Margin */}
                <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {isMarginPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    ${calc ? calc.margin.toFixed(2) : '-'}
                  </span>
                </div>
                {/* Margin % */}
                <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)' }}>
                  {calc ? `${calc.marginPercent.toFixed(1)}%` : '-'}
                </div>
                {/* Actions: detach */}
                <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {isEditable && (
                    <button
                      onClick={() => onDetach(c.id)}
                      disabled={detachingIds.has(c.id)}
                      className="btn btn-danger btn-sm"
                      title="Remove from quote"
                      style={{ padding: '6px 10px' }}
                      data-cy="corridor-detach"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
