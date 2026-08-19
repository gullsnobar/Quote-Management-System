import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { quotesApi } from '../api/quotesApi'
import { corridorsApi } from '../api/corridorsApi'
import type { Quote, QuoteStatus } from '../types/quote'
import type { Corridor, CorridorFilters as FiltersType } from '../types/corridor'
import { Navbar } from '../components/Navbar'
import { StatusBadge } from '../components/StatusBadge'
import { CorridorFilters } from '../components/corridors/CorridorFilters'
import { CorridorsTable } from '../components/corridors/CorridorsTable'
import {
  ArrowLeft,
  FileEdit,
  Save,
  Send,
  Lock,
  Layers,
  Info,
  CheckCircle2,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

export const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // Quote State
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isQuoteLoading, setIsQuoteLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'corridors'>('corridors')
  const [isConflict, setIsConflict] = useState(false)

  // Edit Mode State (AC-3)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPartner, setEditPartner] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Corridors State (AC-4, AC-5, AC-6)
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [corridorsCount, setCorridorsCount] = useState(0)
  const [isCorridorsLoading, setIsCorridorsLoading] = useState(false)
  const [filters, setFilters] = useState<FiltersType>({})

  // Quote-specific corridors (AC-4)
  const [quoteCorridors, setQuoteCorridors] = useState<Corridor[]>([])
  const [isQuoteCorridorsLoading, setIsQuoteCorridorsLoading] = useState(false)
  const [corridorSubTab, setCorridorSubTab] = useState<'my-corridors' | 'catalog'>('my-corridors')
  const [attachingIds, setAttachingIds] = useState<Set<number>>(new Set())
  const [detachingIds, setDetachingIds] = useState<Set<number>>(new Set())

  // Bulk selection state (AC-4 efficiency)
  const [selectedCorridorIds, setSelectedCorridorIds] = useState<Set<number>>(new Set())
  const [isBulkAttaching, setIsBulkAttaching] = useState(false)
  const [isBulkDetaching, setIsBulkDetaching] = useState(false)

  // Loading guards to prevent duplicate API calls (fixes StrictMode double-fire)
  const isFetchingCorridors = useRef(false)
  const isFetchingQuoteCorridors = useRef(false)

  // Fetch Quote Details
  const fetchQuote = async () => {
    if (!id) return
    try {
      setIsQuoteLoading(true)
      setIsConflict(false)
      const res = await quotesApi.getQuote(id)
      setQuote(res.data)
      setEditName(res.data.name)
      setEditPartner(res.data.partnerName)
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Quote not found' })
    } finally {
      setIsQuoteLoading(false)
    }
  }

  // Fetch Corridors (with all active filters) — guarded against duplicate calls
  const fetchCorridors = useCallback(async () => {
    if (isFetchingCorridors.current) return
    isFetchingCorridors.current = true
    try {
      setIsCorridorsLoading(true)
      const res = await corridorsApi.getCorridors(filters)
      setCorridors(res.data)
      setCorridorsCount(res.count)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsCorridorsLoading(false)
      isFetchingCorridors.current = false
    }
  }, [filters])

  // Fetch quote-specific corridors (AC-4) — guarded against duplicate calls
  const fetchQuoteCorridors = useCallback(async () => {
    if (!id || isFetchingQuoteCorridors.current) return
    isFetchingQuoteCorridors.current = true
    try {
      setIsQuoteCorridorsLoading(true)
      const res = await quotesApi.getQuoteCorridors(id)
      setQuoteCorridors(res.data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsQuoteCorridorsLoading(false)
      isFetchingQuoteCorridors.current = false
    }
  }, [id])

  // Attach a corridor to the quote (AC-4)
  const handleAttachCorridor = async (corridorId: number) => {
    if (!id || !isEditable) return
    setAttachingIds((prev) => new Set(prev).add(corridorId))
    try {
      const res = await quotesApi.attachCorridors(id, [corridorId])
      setQuoteCorridors(res.data)
      setNotification({ type: 'success', message: 'Corridor attached to quote.' })
      setTimeout(() => setNotification(null), 3000)
    } catch (err: any) {
      setNotification({
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

  // Detach a corridor from the quote (AC-4)
  const handleDetachCorridor = async (corridorId: number) => {
    if (!id || !isEditable) return
    setDetachingIds((prev) => new Set(prev).add(corridorId))
    try {
      const res = await quotesApi.detachCorridors(id, [corridorId])
      setQuoteCorridors(res.data)
      setNotification({ type: 'success', message: 'Corridor removed from quote.' })
      setTimeout(() => setNotification(null), 3000)
    } catch (err: any) {
      setNotification({
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

  // Bulk attach selected corridors (AC-4 efficiency)
  const handleBulkAttach = async () => {
    if (!id || !isEditable || selectedCorridorIds.size === 0) return
    setIsBulkAttaching(true)
    try {
      const ids = Array.from(selectedCorridorIds)
      const res = await quotesApi.attachCorridors(id, ids)
      setQuoteCorridors(res.data)
      setNotification({ type: 'success', message: `${ids.length} corridor${ids.length !== 1 ? 's' : ''} attached to quote.` })
      setTimeout(() => setNotification(null), 3000)
      setSelectedCorridorIds(new Set())
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to attach corridors',
      })
    } finally {
      setIsBulkAttaching(false)
    }
  }

  // Bulk detach selected corridors from My Corridors tab
  const handleBulkDetach = async () => {
    if (!id || !isEditable || selectedCorridorIds.size === 0) return
    setIsBulkDetaching(true)
    try {
      const ids = Array.from(selectedCorridorIds)
      const res = await quotesApi.detachCorridors(id, ids)
      setQuoteCorridors(res.data)
      setNotification({ type: 'success', message: `${ids.length} corridor${ids.length !== 1 ? 's' : ''} removed from quote.` })
      setTimeout(() => setNotification(null), 3000)
      setSelectedCorridorIds(new Set())
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to detach corridors',
      })
    } finally {
      setIsBulkDetaching(false)
    }
  }

  // Toggle individual corridor selection
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

  // Select/deselect all filtered corridors (excluding already-attached)
  const toggleSelectAll = () => {
    const attachableIds = corridors
      .filter((c) => !quoteCorridors.some((qc) => qc.id === c.id))
      .map((c) => c.id)

    setSelectedCorridorIds((prev) => {
      const allSelected = attachableIds.every((cid) => prev.has(cid))
      if (allSelected) {
        // Deselect all attachable
        const next = new Set(prev)
        attachableIds.forEach((cid) => next.delete(cid))
        return next
      }
      // Select all attachable
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

  useEffect(() => {
    fetchQuote()
  }, [id])

  useEffect(() => {
    if (activeTab === 'corridors') {
      fetchQuoteCorridors()
      fetchCorridors()
    }
  }, [activeTab, filters])

  // AC-9: Detect external changes when the tab/window regains focus.
  // If another tab edited this quote, the version will differ and we
  // notify the user without overwriting their unsaved edits.
  useEffect(() => {
    const handleFocus = () => {
      if (!id || isEditing) return
      quotesApi.getQuote(id).then((res) => {
        setQuote((prev) => {
          if (prev && res.data.version !== prev.version) {
            setNotification({
              type: 'error',
              message: `This quote was updated externally (v${prev.version} → v${res.data.version}). Reloading the latest version.`,
            })
            setTimeout(() => setNotification(null), 5000)
            return res.data
          }
          return prev
        })
      }).catch(() => {
        // Ignore focus-refresh errors silently
      })
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id, isEditing])

  // Save changes (AC-3)
  const handleSave = async () => {
    if (!quote || !id) return
    setIsSaving(true)
    setNotification(null)

    try {
      const res = await quotesApi.updateQuote(id, {
        name: editName,
        partnerName: editPartner,
        version: quote.version,
      })
      setQuote(res.data)
      setIsEditing(false)
      setIsConflict(false)
      setNotification({ type: 'success', message: 'Quote updated successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsConflict(true)
        setNotification({
          type: 'error',
          message: err.response?.data?.message || 'This quote was modified by another user. Please reload the latest version before saving.',
        })
        return
      }

      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update quote',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Submit quote for review (AC-3)
  const handleSubmit = async () => {
    if (!quote || !id) return
    if (!window.confirm('Submit this quote for review? Editing will be locked once submitted.')) return

    setIsSubmitting(true)
    setNotification(null)

    try {
      const res = await quotesApi.submitQuote(id)
      setQuote(res.data)
      setIsEditing(false)
      setNotification({ type: 'success', message: 'Quote submitted for review! Status is now in_review.' })
      setTimeout(() => setNotification(null), 3000)
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Submission failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditable = quote?.status === 'draft' || quote?.status === 'rejected'

  if (isQuoteLoading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: 1400, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid var(--border-medium)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading quote details...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '32px', textAlign: 'center' }} className="glass-panel">
          <AlertTriangle size={36} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Quote Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>This quote does not exist or you do not have permission to view it.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <Navbar />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Quotes Dashboard</span>
        </Link>

        {/* Notification Banner */}
        {notification && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            border: `1px solid ${notification.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            color: notification.type === 'success' ? 'var(--text-success)' : 'var(--text-danger)',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {isConflict && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--conflict-bg)',
            border: '1px solid var(--conflict-border)',
            color: 'var(--conflict-text)',
            fontSize: 14,
          }}>
            <span>Another user changed this quote while you were editing it.</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fetchQuote()}
            >
              Reload Latest Version
            </button>
          </div>
        )}

        {/* Quote Header / Action Bar (AC-3 View/Edit/Submit) */}
        <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                  QUOTE #{quote.id}
                </span>
                <StatusBadge status={quote.status as QuoteStatus} />
                {!isEditable && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    background: 'var(--locked-bg)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    <Lock size={12} />
                    <span>Locked (Read-Only)</span>
                  </span>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Quote Name"
                    style={{ minWidth: 260 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editPartner}
                    onChange={(e) => setEditPartner(e.target.value)}
                    placeholder="Partner Name"
                    style={{ minWidth: 220 }}
                  />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)' }}>{quote.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={14} color="var(--primary)" />
                      {quote.partnerName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} />
                      Created: {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions for Edit & Submit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isEditable ? (
                isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditName(quote.name)
                        setEditPartner(quote.partnerName)
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <RotateCcw size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn btn-primary btn-sm"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      <FileEdit size={14} />
                      <span>Edit Mode</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn btn-success btn-sm"
                      title="Submit Quote for Review (AC-3)"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Quote'}</span>
                    </button>
                  </>
                )
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} />
                  <span>Editing disabled in {quote.status} status</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
          paddingBottom: 4,
        }}>
          <button
            onClick={() => setActiveTab('corridors')}
            className={`btn btn-sm ${activeTab === 'corridors' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <Layers size={16} />
            <span>Corridors Pricing Tab (AC-4 & AC-6)</span>
            <span style={{
              background: 'var(--tab-count-bg)',
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: 11,
            }}>
              3,000
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <Info size={16} />
            <span>Quote Overview</span>
          </button>
        </div>

        {/* Tab 1: Corridors (AC-4, AC-5, AC-6) */}
        {activeTab === 'corridors' && (
          <section className="animate-fade-in">
            {/* Sub-tab toggle: My Corridors vs Browse Catalog */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              padding: 4,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              width: 'fit-content',
            }}>
              <button
                onClick={() => handleSubTabChange('my-corridors')}
                className={`btn btn-sm ${corridorSubTab === 'my-corridors' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Layers size={14} />
                <span>My Corridors</span>
                <span style={{
                  background: 'var(--tab-count-bg)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 11,
                }}>
                  {quoteCorridors.length}
                </span>
              </button>
              <button
                onClick={() => handleSubTabChange('catalog')}
                className={`btn btn-sm ${corridorSubTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} />
                <span>Browse Catalog</span>
                <span style={{
                  background: 'var(--tab-count-bg)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 11,
                }}>
                  3,000
                </span>
              </button>
            </div>

            {/* Sub-tab: My Corridors (quote-specific, AC-4) */}
            {corridorSubTab === 'my-corridors' && (
              <div>
                {isQuoteCorridorsLoading ? (
                  <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '3px solid var(--border-medium)',
                      borderTopColor: 'var(--primary)',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px',
                    }} />
                    <p style={{ color: 'var(--text-muted)' }}>Loading quote corridors...</p>
                  </div>
                ) : quoteCorridors.length === 0 ? (
                  <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}>
                      <Layers size={24} />
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Corridors Attached</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                      {isEditable
                        ? 'Browse the global catalog and attach corridors to this quote to calculate pricing.'
                        : 'This quote has no corridors attached. Editing is locked.'}
                    </p>
                    {isEditable && (
                      <button
                        onClick={() => handleSubTabChange('catalog')}
                        className="btn btn-primary btn-sm"
                      >
                        <Plus size={14} />
                        <span>Browse Catalog & Add</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700 }}>Corridors Attached to This Quote</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {quoteCorridors.length} corridor{quoteCorridors.length !== 1 ? 's' : ''} · Pricing calculated on backend (AC-6)
                        </p>
                      </div>
                      {isEditable && selectedCorridorIds.size > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {selectedCorridorIds.size} selected
                          </span>
                          <button
                            onClick={handleBulkDetach}
                            disabled={isBulkDetaching}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={14} />
                            <span>{isBulkDetaching ? 'Removing...' : `Remove ${selectedCorridorIds.size} Selected`}</span>
                          </button>
                          <button
                            onClick={() => setSelectedCorridorIds(new Set())}
                            className="btn btn-secondary btn-sm"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }}>
                      <div style={{ minWidth: '1300px', width: '100%' }}>
                        {/* Header row */}
                        <div style={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                          display: 'grid',
                          gridTemplateColumns: '40px 70px minmax(180px,1.5fr) minmax(180px,1.4fr) minmax(260px,2.3fr) 90px 170px 150px 150px 150px 110px 60px',
                          background: 'var(--table-header-bg)',
                          borderBottom: '2px solid var(--border-medium)',
                          lineHeight: 1.2,
                        }}>
                          {/* Checkbox column */}
                          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                            {isEditable && (
                              <input
                                type="checkbox"
                                checked={quoteCorridors.length > 0 && quoteCorridors.every((qc) => selectedCorridorIds.has(qc.id))}
                                onChange={() => {
                                  if (quoteCorridors.every((qc) => selectedCorridorIds.has(qc.id))) {
                                    // Deselect all
                                    setSelectedCorridorIds(new Set())
                                  } else {
                                    // Select all
                                    setSelectedCorridorIds(new Set(quoteCorridors.map((qc) => qc.id)))
                                  }
                                }}
                                style={{ cursor: 'pointer', width: 16, height: 16 }}
                              />
                            )}
                          </div>
                          {['# ID', 'Region / Country', 'Type & Service', 'Receiving Partner & Payer', 'Payout Ccy', 'ATV (USD)', 'Revenue ($)', 'Cost ($)', 'Margin ($)', 'Margin %', ''].map((header, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '14px 16px',
                                color: index === 6 ? 'var(--cyan)' : index === 7 ? 'var(--text-danger)' : index === 8 || index === 9 ? 'var(--text-muted)' : 'var(--text-muted)',
                                fontWeight: index >= 6 && index <= 9 ? 700 : 600,
                                background: index === 6 ? 'rgba(6, 182, 212, 0.05)' : index === 7 ? 'rgba(239, 68, 68, 0.05)' : index === 8 || index === 9 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                textAlign: index >= 4 && index <= 9 ? 'right' : 'left',
                              }}
                            >
                              {header}
                            </div>
                          ))}
                        </div>
                        {/* Data rows */}
                        {quoteCorridors.map((c, rowIndex) => {
                          const calc = c.calculations
                          const isMarginPositive = calc ? calc.margin >= 0 : false
                          const isSelected = selectedCorridorIds.has(c.id)
                          return (
                            <div
                              key={c.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 70px minmax(180px,1.5fr) minmax(180px,1.4fr) minmax(260px,2.3fr) 90px 170px 150px 150px 150px 110px 60px',
                                borderBottom: '1px solid var(--border-subtle)',
                                backgroundColor: isSelected ? 'var(--primary-light)' : rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--table-row-hover-bg)' }}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  isSelected ? 'var(--primary-light)' : rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)')
                              }
                            >
                              {/* Checkbox */}
                              <div style={{ padding: '12px 12px', display: 'flex', alignItems: 'center' }}>
                                {isEditable && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCorridorSelection(c.id)}
                                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                              {/* ID */}
                              <div style={{ padding: '12px 16px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                {c.corridorId || c.id}
                              </div>
                              {/* Region / Country */}
                              <div style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.country}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.region}</div>
                              </div>
                              {/* Type & Service */}
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
                              {/* Receiving Partner & Payer */}
                              <div style={{ padding: '12px 16px', minWidth: 0 }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {c.receivingPartner}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {c.payer}
                                </div>
                              </div>
                              {/* Payout Currency */}
                              <div style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {c.payoutCurrency}
                              </div>
                              {/* ATV (USD) */}
                              <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                ${Number(c.atvUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              {/* Revenue */}
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
                              {/* Cost */}
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
                              {/* Margin */}
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
                              {/* Margin % */}
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
                              {/* Detach button */}
                              <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {isEditable && (
                                  <button
                                    onClick={() => handleDetachCorridor(c.id)}
                                    disabled={detachingIds.has(c.id)}
                                    className="btn btn-danger btn-sm"
                                    title="Remove from quote"
                                    style={{ padding: '6px 10px' }}
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
                )}
              </div>
            )}

            {/* Sub-tab: Browse Catalog (global, with attach, AC-4 & AC-5) */}
            {corridorSubTab === 'catalog' && (
              <div>
                {/* Filters Bar */}
                <CorridorFilters
                  filters={filters}
                  onChange={setFilters}
                  onClear={() => { setFilters({}); setSelectedCorridorIds(new Set()) }}
                  totalCount={3000}
                  filteredCount={corridorsCount}
                  isLoading={isCorridorsLoading}
                />

                {/* Bulk action bar */}
                {isEditable && corridors.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    marginBottom: 12,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={corridors.length > 0 && corridors
                            .filter((c) => !quoteCorridors.some((qc) => qc.id === c.id))
                            .every((c) => selectedCorridorIds.has(c.id))
                          }
                          onChange={toggleSelectAll}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                        <span>Select All (filtered, not yet attached)</span>
                      </label>
                    </div>
                    {selectedCorridorIds.size > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                          {selectedCorridorIds.size} selected
                        </span>
                        <button
                          onClick={handleBulkAttach}
                          disabled={isBulkAttaching}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus size={14} />
                          <span>{isBulkAttaching ? 'Attaching...' : `Attach ${selectedCorridorIds.size} Selected`}</span>
                        </button>
                        <button
                          onClick={() => setSelectedCorridorIds(new Set())}
                          className="btn btn-secondary btn-sm"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Corridors Table with checkboxes + attach buttons */}
                {isCorridorsLoading ? (
                  <CorridorsTable corridors={[]} isLoading={true} />
                ) : corridors.length === 0 ? (
                  <CorridorsTable corridors={[]} isLoading={false} />
                ) : (
                  <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{ maxHeight: 720, overflowY: 'auto' }}>
                      {/* Catalog header */}
                      <div style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        display: 'grid',
                        gridTemplateColumns: '40px minmax(160px,1.5fr) minmax(160px,1.4fr) minmax(220px,2fr) 80px 150px 130px 130px 110px 50px',
                        background: 'var(--table-header-bg)',
                        borderBottom: '2px solid var(--border-medium)',
                        lineHeight: 1.2,
                      }}>
                        {['', 'Region / Country', 'Type & Service', 'Receiving Partner', 'Ccy', 'ATV (USD)', 'Revenue ($)', 'Cost ($)', 'Margin %', ''].map((header, index) => (
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
                      {corridors.map((c, rowIndex) => {
                        const calc = c.calculations
                        const isMarginPositive = calc ? calc.margin >= 0 : false
                        const isAttached = quoteCorridors.some((qc) => qc.id === c.id)
                        const isAttaching = attachingIds.has(c.id)
                        const isSelected = selectedCorridorIds.has(c.id)
                        return (
                          <div
                            key={c.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '40px minmax(160px,1.5fr) minmax(160px,1.4fr) minmax(220px,2fr) 80px 150px 130px 130px 110px 50px',
                              borderBottom: '1px solid var(--border-subtle)',
                              backgroundColor: isSelected ? 'var(--primary-light)' : rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)',
                              transition: 'background-color 0.15s ease',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--table-row-hover-bg)' }}
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                isSelected ? 'var(--primary-light)' : rowIndex % 2 === 0 ? 'transparent' : 'var(--table-row-alt-bg)')
                            }
                          >
                            {/* Checkbox */}
                            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                              {isEditable && !isAttached && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCorridorSelection(c.id)}
                                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                                />
                              )}
                            </div>
                            {/* Region / Country */}
                            <div style={{ padding: '10px 14px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13 }}>
                                {c.country}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                                {c.region}
                              </div>
                            </div>
                            {/* Type & Service */}
                            <div style={{ padding: '10px 14px' }}>
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
                            {/* Receiving Partner */}
                            <div style={{ padding: '10px 14px', minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.receivingPartner}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.payer}
                              </div>
                            </div>
                            {/* Payout Currency */}
                            <div style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                              {c.payoutCurrency}
                            </div>
                            {/* ATV */}
                            <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                              ${Number(c.atvUsd).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            {/* Revenue */}
                            <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)' }}>
                              ${calc ? calc.revenue.toFixed(2) : '-'}
                            </div>
                            {/* Cost */}
                            <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-danger)' }}>
                              ${calc ? calc.cost.toFixed(2) : '-'}
                            </div>
                            {/* Margin % */}
                            <div style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: isMarginPositive ? 'var(--text-success)' : 'var(--text-danger)' }}>
                              {calc ? `${calc.marginPercent.toFixed(1)}%` : '-'}
                            </div>
                            {/* Attach button */}
                            <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                              {isEditable && (
                                <button
                                  onClick={() => handleAttachCorridor(c.id)}
                                  disabled={isAttached || isAttaching}
                                  className={isAttached ? 'btn btn-success btn-sm' : 'btn btn-secondary btn-sm'}
                                  title={isAttached ? 'Already attached' : 'Attach to quote'}
                                  style={{ padding: '6px 10px' }}
                                >
                                  {isAttached ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Overview */}
        {activeTab === 'overview' && (
          <section className="glass-panel animate-fade-in" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quote Information</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quote Identifier</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)', marginTop: 4 }}>
                  QUOTE #{quote.id}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Commercial Partner</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                  {quote.partnerName}
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lifecycle Status</div>
                <div style={{ marginTop: 8 }}>
                  <StatusBadge status={quote.status as QuoteStatus} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Corridors Catalog Reference</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                  3,000 Global Routes Available
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
