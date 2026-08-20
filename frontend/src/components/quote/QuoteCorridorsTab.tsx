import React, { useCallback, useEffect, useRef, useState } from 'react'
import { quotesApi } from '../../api/quotesApi'
import { useAttachCorridorsMutation, useDetachCorridorsMutation, useUpdateNegotiatedFeeMutation } from '../../hooks/useQuoteQueries'
import { useCorridorsQuery } from '../../hooks/useCorridorsQuery'
import type { Corridor, CorridorFilters as FiltersType } from '../../types/corridor'
import type { QuoteId } from '../../lib/queryKeys'
import { MyCorridors } from './MyCorridors'
import { BrowseCorridors } from './BrowseCorridors'
import { Layers, Plus } from 'lucide-react'

/**
 * Props for the QuoteCorridorsTab component.
 *
 * The parent (QuoteDetails) passes the quote ID, editability flag, and
 * two callbacks: one for notifications and one for audit trail refresh.
 * All corridor-specific state, handlers, and effects live here.
 */
export interface QuoteCorridorsTabProps {
  /** The quote ID (from route params). */
  quoteId: QuoteId | undefined
  /** Whether the quote can be edited (status is draft or rejected). */
  isEditable: boolean
  /** Show a notification banner in the parent. */
  onNotification: (notification: { type: 'success' | 'error'; message: string } | null) => void
  /** Trigger an audit trail refresh in the parent. */
  onAuditRefresh: () => void
}

/**
 * Manages the Corridors tab: sub-tab navigation (My Corridors vs
 * Browse Catalog), corridor selection, bulk attach/detach, and
 * the corridor catalog query with debounced filters.
 *
 * This component owns all corridor-related state that was previously
 * inline in QuoteDetails. It delegates rendering to MyCorridors
 * (attached corridors table) and BrowseCorridors (catalog with
 * virtualization).
 *
 * State owned:
 *   - Sub-tab selection (my-corridors / catalog)
 *   - Filter state + debounced filter state
 *   - Quote-specific corridors (manual fetch — not yet migrated to TanStack Query)
 *   - Per-corridor attach/detach loading state
 *   - Bulk attach/detach loading state
 *   - Selection state (Set of corridor IDs)
 *
 * Queries/mutations used:
 *   - useCorridorsQuery (catalog, enabled when tab is active)
 *   - useAttachCorridorsMutation
 *   - useDetachCorridorsMutation
 */
export const QuoteCorridorsTab: React.FC<QuoteCorridorsTabProps> = ({
  quoteId,
  isEditable,
  onNotification,
  onAuditRefresh,
}) => {
  // Sub-tab state
  const [corridorSubTab, setCorridorSubTab] = useState<'my-corridors' | 'catalog'>('my-corridors')

  // Filter state with debounce
  const [filters, setFilters] = useState<FiltersType>({})
  const [debouncedFilters, setDebouncedFilters] = useState<FiltersType>({})

  // Catalog query — enabled when this tab is active (always true here
  // since QuoteDetails only renders this component when activeTab === 'corridors')
  const {
    data: corridorsData,
    isLoading: isCorridorsLoading,
  } = useCorridorsQuery(debouncedFilters, {
    enabled: true,
  })
  const corridors = corridorsData?.data ?? []
  const corridorsCount = corridorsData?.count ?? 0

  // Mutations
  const attachMutation = useAttachCorridorsMutation()
  const detachMutation = useDetachCorridorsMutation()
  const updateFeeMutation = useUpdateNegotiatedFeeMutation()

  // Quote-specific corridors (manual fetch — not yet migrated to TanStack Query)
  const [quoteCorridors, setQuoteCorridors] = useState<Corridor[]>([])
  const [isQuoteCorridorsLoading, setIsQuoteCorridorsLoading] = useState(false)
  const isFetchingQuoteCorridors = useRef(false)

  // Per-corridor loading state
  const [attachingIds, setAttachingIds] = useState<Set<number>>(new Set())
  const [detachingIds, setDetachingIds] = useState<Set<number>>(new Set())
  const [updatingFeeIds, setUpdatingFeeIds] = useState<Set<number>>(new Set())

  // Bulk operation state
  const [selectedCorridorIds, setSelectedCorridorIds] = useState<Set<number>>(new Set())
  const [isBulkAttaching, setIsBulkAttaching] = useState(false)
  const [isBulkDetaching, setIsBulkDetaching] = useState(false)

  // Debounce filter changes — only fetch after user stops changing for 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters])

  // Fetch quote-specific corridors — guarded against duplicate calls
  const fetchQuoteCorridors = useCallback(async () => {
    if (!quoteId || isFetchingQuoteCorridors.current) return
    isFetchingQuoteCorridors.current = true
    try {
      setIsQuoteCorridorsLoading(true)
      const res = await quotesApi.getQuoteCorridors(quoteId)
      setQuoteCorridors(res.data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsQuoteCorridorsLoading(false)
      isFetchingQuoteCorridors.current = false
    }
  }, [quoteId])

  // Fetch attached corridors on mount and when filters change
  // (filter changes re-trigger catalog fetch, which may affect
  // the "attachable" set in the catalog sub-tab)
  useEffect(() => {
    fetchQuoteCorridors()
  }, [debouncedFilters, fetchQuoteCorridors])

  // Attach a single corridor
  const handleAttachCorridor = async (corridorId: number) => {
    if (!quoteId || !isEditable) return
    setAttachingIds((prev) => new Set(prev).add(corridorId))
    try {
      const res = await attachMutation.mutateAsync({ quoteId, corridorIds: [corridorId] })
      setQuoteCorridors(res.data)
      onAuditRefresh()
      onNotification({ type: 'success', message: 'Corridor attached to quote.' })
      setTimeout(() => onNotification(null), 3000)
    } catch (err: any) {
      onNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to attach corridor',
      })
    } finally {
      setAttachingIds((prev) => {
        const next = new Set(prev)
        next.delete(corridorId)
        return next
      })
    }
  }

  // Detach a single corridor
  const handleDetachCorridor = async (corridorId: number) => {
    if (!quoteId || !isEditable) return
    setDetachingIds((prev) => new Set(prev).add(corridorId))
    try {
      const res = await detachMutation.mutateAsync({ quoteId, corridorIds: [corridorId] })
      setQuoteCorridors(res.data)
      onAuditRefresh()
      onNotification({ type: 'success', message: 'Corridor removed from quote.' })
      setTimeout(() => onNotification(null), 3000)
    } catch (err: any) {
      onNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to detach corridor',
      })
    } finally {
      setDetachingIds((prev) => {
        const next = new Set(prev)
        next.delete(corridorId)
        return next
      })
    }
  }

  // Update negotiated fee for a corridor
  const handleUpdateNegotiatedFee = async (corridorId: number, negotiatedFee: number | null) => {
    if (!quoteId || !isEditable) return
    setUpdatingFeeIds((prev) => new Set(prev).add(corridorId))
    try {
      const res = await updateFeeMutation.mutateAsync({ quoteId, corridorId, negotiatedFee })
      setQuoteCorridors(res.data)
      onAuditRefresh()
      onNotification({
        type: 'success',
        message: negotiatedFee === null
          ? 'Negotiated fee cleared. Using standard catalog price.'
          : `Negotiated fee set to $${negotiatedFee.toFixed(2)}.`,
      })
      setTimeout(() => onNotification(null), 3000)
    } catch (err: any) {
      onNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update negotiated fee',
      })
      throw err
    } finally {
      setUpdatingFeeIds((prev) => {
        const next = new Set(prev)
        next.delete(corridorId)
        return next
      })
    }
  }

  // Bulk attach selected corridors
  const handleBulkAttach = async () => {
    if (!quoteId || !isEditable || selectedCorridorIds.size === 0) return
    setIsBulkAttaching(true)
    try {
      const ids = Array.from(selectedCorridorIds)
      const res = await attachMutation.mutateAsync({ quoteId, corridorIds: ids })
      setQuoteCorridors(res.data)
      onAuditRefresh()
      onNotification({ type: 'success', message: `${ids.length} corridor${ids.length !== 1 ? 's' : ''} attached to quote.` })
      setTimeout(() => onNotification(null), 3000)
      setSelectedCorridorIds(new Set())
    } catch (err: any) {
      onNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to attach corridors',
      })
    } finally {
      setIsBulkAttaching(false)
    }
  }

  // Bulk detach selected corridors
  const handleBulkDetach = async () => {
    if (!quoteId || !isEditable || selectedCorridorIds.size === 0) return
    setIsBulkDetaching(true)
    try {
      const ids = Array.from(selectedCorridorIds)
      const res = await detachMutation.mutateAsync({ quoteId, corridorIds: ids })
      setQuoteCorridors(res.data)
      onAuditRefresh()
      onNotification({ type: 'success', message: `${ids.length} corridor${ids.length !== 1 ? 's' : ''} removed from quote.` })
      setTimeout(() => onNotification(null), 3000)
      setSelectedCorridorIds(new Set())
    } catch (err: any) {
      onNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to detach corridors',
      })
    } finally {
      setIsBulkDetaching(false)
    }
  }

  // Selection handlers
  const toggleCorridorSelection = (corridorId: number) => {
    setSelectedCorridorIds((prev) => {
      const next = new Set(prev)
      if (next.has(corridorId)) {
        next.delete(corridorId)
      } else {
        next.add(corridorId)
      }
      return next
    })
  }

  // Select/deselect all attached corridors (for My Corridors sub-tab)
  const handleSelectAllAttached = () => {
    setSelectedCorridorIds((prev) => {
      if (quoteCorridors.length > 0 && quoteCorridors.every((qc) => prev.has(qc.id))) {
        return new Set()
      }
      return new Set(quoteCorridors.map((qc) => qc.id))
    })
  }

  // Select/deselect all filtered, not-yet-attached corridors (for catalog sub-tab)
  const handleToggleSelectAll = () => {
    const attachableIds = corridors
      .filter((c) => !quoteCorridors.some((qc) => qc.id === c.id))
      .map((c) => c.id)

    setSelectedCorridorIds((prev) => {
      const allSelected = attachableIds.every((cid) => prev.has(cid))
      if (allSelected) {
        const next = new Set(prev)
        attachableIds.forEach((cid) => next.delete(cid))
        return next
      }
      const next = new Set(prev)
      attachableIds.forEach((cid) => next.add(cid))
      return next
    })
  }

  // Clear selection when switching sub-tabs
  const handleSubTabChange = (tab: 'my-corridors' | 'catalog') => {
    setSelectedCorridorIds(new Set())
    setCorridorSubTab(tab)
  }

  // Build a Set of attached corridor IDs for the catalog's "Attached" state
  const attachedCorridorIds = new Set(quoteCorridors.map((qc) => qc.id))

  return (
    <section className="animate-fade-in">
      {/* Sub-tab toggle: My Corridors vs Browse Catalog */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="sub-tab-group">
          <button
            onClick={() => handleSubTabChange('my-corridors')}
            className={`sub-tab ${corridorSubTab === 'my-corridors' ? 'sub-tab-active' : ''}`}
            data-cy="subtab-my-corridors"
          >
            <Layers size={14} />
            <span>My Corridors</span>
            <span className="sub-tab-count">{quoteCorridors.length}</span>
          </button>
          <button
            onClick={() => handleSubTabChange('catalog')}
            className={`sub-tab ${corridorSubTab === 'catalog' ? 'sub-tab-active' : ''}`}
            data-cy="subtab-browse-catalog"
          >
            <Plus size={14} />
            <span>Browse Catalog</span>
            <span className="sub-tab-count">{corridorsCount > 0 ? corridorsCount.toLocaleString() : '3,000'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab: My Corridors */}
      {corridorSubTab === 'my-corridors' && (
        <MyCorridors
          corridors={quoteCorridors}
          isLoading={isQuoteCorridorsLoading}
          isEditable={isEditable}
          selectedIds={selectedCorridorIds}
          onToggleSelection={toggleCorridorSelection}
          onSelectAll={handleSelectAllAttached}
          onClearSelection={() => setSelectedCorridorIds(new Set())}
          onDetach={handleDetachCorridor}
          onBulkDetach={handleBulkDetach}
          detachingIds={detachingIds}
          isBulkDetaching={isBulkDetaching}
          onBrowseCatalog={() => handleSubTabChange('catalog')}
          onUpdateNegotiatedFee={handleUpdateNegotiatedFee}
          updatingFeeIds={updatingFeeIds}
        />
      )}

      {/* Sub-tab: Browse Catalog */}
      {corridorSubTab === 'catalog' && (
        <BrowseCorridors
          corridors={corridors}
          isLoading={isCorridorsLoading}
          isEditable={isEditable}
          attachedCorridorIds={attachedCorridorIds}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => { setFilters({}); setSelectedCorridorIds(new Set()) }}
          selectedIds={selectedCorridorIds}
          onToggleSelection={toggleCorridorSelection}
          onToggleSelectAll={handleToggleSelectAll}
          onClearSelection={() => setSelectedCorridorIds(new Set())}
          onAttach={handleAttachCorridor}
          onBulkAttach={handleBulkAttach}
          attachingIds={attachingIds}
          isBulkAttaching={isBulkAttaching}
          totalCount={3000}
          filteredCount={corridorsCount}
        />
      )}
    </section>
  )
}
