import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Corridor, CorridorFilters as FiltersType } from '../../types/corridor'
import { CorridorFilters } from '../corridors/CorridorFilters'
import { TrendingUp, TrendingDown, Plus, AlertCircle } from 'lucide-react'
export interface BrowseCorridorsProps {
  /** Filtered corridors from the catalog query. */
  corridors: Corridor[]
  /** Whether the catalog query is loading. */
  isLoading: boolean
  /** Whether the quote can be edited (status is draft or rejected). */
  isEditable: boolean
  /** IDs of corridors already attached to the quote (to show "Attached" state). */
  attachedCorridorIds: Set<number>
  /** Current filter values. */
  filters: FiltersType
  /** Update filter values. */
  onFiltersChange: (filters: FiltersType) => void
  /** Clear all filters and selection. */
  onClearFilters: () => void
  /** Set of corridor IDs currently selected for bulk attach. */
  selectedIds: Set<number>
  /** Toggle selection of a single corridor. */
  onToggleSelection: (corridorId: number) => void
  /** Select/deselect all filtered, not-yet-attached corridors. */
  onToggleSelectAll: () => void
  /** Clear all selections. */
  onClearSelection: () => void
  /** Attach a single corridor to the quote. */
  onAttach: (corridorId: number) => void
  /** Bulk attach all selected corridors. */
  onBulkAttach: () => void
  /** Set of corridor IDs currently being attached (per-row loading). */
  attachingIds: Set<number>
  /** Whether a bulk attach operation is in progress. */
  isBulkAttaching: boolean
  /** Total corridor count (for filter summary). */
  totalCount: number
  /** Filtered corridor count (for filter summary). */
  filteredCount: number
}

const COLUMN_TEMPLATE = '40px minmax(160px,1.5fr) minmax(160px,1.4fr) minmax(220px,2fr) 80px 150px 130px 130px 110px 50px'

const HEADERS = ['', 'Region / Country', 'Type & Service', 'Receiving Partner', 'Ccy', 'ATV (USD)', 'Revenue ($)', 'Cost ($)', 'Margin %', '']

/**
 * Renders the "Browse Catalog" sub-tab: the global corridor catalog
 * with filters, virtualized table, selection, and attach capabilities.
 *
 * Uses @tanstack/react-virtual for virtualization — essential for the
 * ~3,000-row catalog. Only visible rows are rendered to the DOM.
 */
export const BrowseCorridors: React.FC<BrowseCorridorsProps> = ({
  corridors,
  isLoading,
  isEditable,
  attachedCorridorIds,
  filters,
  onFiltersChange,
  onClearFilters,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onClearSelection,
  onAttach,
  onBulkAttach,
  attachingIds,
  isBulkAttaching,
  totalCount,
  filteredCount,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: corridors.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 8,
  })

  return (
    <div>
      <CorridorFilters
        filters={filters}
        onChange={onFiltersChange}
        onClear={onClearFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
        isLoading={isLoading}
      />

      {/* Bulk action bar */}
      {isEditable && corridors.length > 0 && (
        <div className="bulk-bar">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={corridors.length > 0 && corridors
                .filter((c) => !attachedCorridorIds.has(c.id))
                .every((c) => selectedIds.has(c.id))
              }
              onChange={onToggleSelectAll}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
              data-cy="select-all-catalog"
            />
            <span>Select All (filtered, not yet attached)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedIds.size > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                {selectedIds.size} selected
              </span>
            )}
            <button onClick={onBulkAttach} disabled={isBulkAttaching || selectedIds.size === 0} className="btn btn-primary btn-sm" data-cy="bulk-attach">
              <Plus size={14} />
              <span>{isBulkAttaching ? 'Attaching...' : `Attach Selected${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}</span>
            </button>
            {selectedIds.size > 0 && (
              <button onClick={onClearSelection} className="btn btn-secondary btn-sm">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Catalog Table */}
      {isLoading ? (
        <div className="glass-panel empty-state">
          <div className="loading-spinner" style={{ width: 48, height: 48 }} />
          <h4 className="empty-state-title">Loading corridors...</h4>
          <p className="empty-state-text">Fetching from backend with calculated pricing</p>
        </div>
      ) : corridors.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <AlertCircle size={24} />
          </div>
          <h4 className="empty-state-title">No Matching Corridors</h4>
          <p className="empty-state-text">Try adjusting your filter criteria to see available routes.</p>
        </div>
      ) : (
        <div className="glass-panel corridor-table-wrapper">
          <div ref={scrollRef} className="corridor-table-scroll" style={{ maxHeight: 720 }}>
            <div style={{ minWidth: '1100px', width: '100%' }}>
              {/* Header */}
              <div className="corridor-table-header" style={{ gridTemplateColumns: COLUMN_TEMPLATE }}>
                {HEADERS.map((header, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 14px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textAlign: index >= 4 && index <= 8 ? 'right' : 'left',
                    }}
                  >
                    {header}
                  </div>
                ))}
              </div>
              {/* Virtualized rows */}
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const c = corridors[virtualRow.index]
                  const calc = c.calculations
                  const isMarginPositive = calc ? calc.margin >= 0 : false
                  const isAttached = attachedCorridorIds.has(c.id)
                  const isAttaching = attachingIds.has(c.id)
                  const isSelected = selectedIds.has(c.id)
                  return (
                    <div
                      key={c.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`corridor-table-row ${isSelected ? 'corridor-table-row-selected' : ''}`}
                      data-cy="catalog-corridor-row"
                      data-cy-corridor-id={c.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${virtualRow.start}px)`,
                        gridTemplateColumns: COLUMN_TEMPLATE,
                        alignItems: 'center',
                        backgroundColor: isSelected ? 'var(--primary-light)' : virtualRow.index % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                      }}
                    >
                      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                        {isEditable && !isAttached && (
                          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(c.id)} style={{ cursor: 'pointer', width: 16, height: 16 }} data-cy="catalog-corridor-checkbox" />
                        )}
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13 }}>{c.country}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{c.region}</div>
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="tx-badge">{c.transactionType}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.service}</span>
                        </div>
                      </div>
                      <div style={{ padding: '10px 14px', minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.receivingPartner}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.payer}
                        </div>
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {c.payoutCurrency}
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                        ${Number(c.atvUsd).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)' }}>
                        ${calc ? calc.revenue.toFixed(2) : '-'}
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-danger)' }}>
                        ${calc ? calc.cost.toFixed(2) : '-'}
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {isMarginPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {calc ? `${calc.marginPercent.toFixed(1)}%` : '-'}
                        </span>
                      </div>
                      <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {isEditable && (
                          isAttached ? (
                            <span style={{ fontSize: 11, color: 'var(--text-success)', fontWeight: 600 }} data-cy="corridor-attached-label">Attached</span>
                          ) : (
                            <button
                              onClick={() => onAttach(c.id)}
                              disabled={isAttaching}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                              data-cy="corridor-attach"
                            >
                              <Plus size={12} />
                              <span>{isAttaching ? '...' : 'Attach'}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
