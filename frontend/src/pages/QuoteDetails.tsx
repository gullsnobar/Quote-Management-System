import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { quotesApi } from '../api/quotesApi'
import { useQuoteQuery, useUpdateQuoteMutation, useSubmitQuoteMutation } from '../hooks/useQuoteQueries'
import { queryKeys } from '../lib/queryKeys'
import type { Quote } from '../types/quote'
import { Navbar } from '../components/Navbar'
import { AuditTrail } from '../components/AuditTrail'
import { QuoteHeader } from '../components/quote/QuoteHeader'
import { QuoteOverviewTab } from '../components/quote/QuoteOverviewTab'
import { QuoteCorridorsTab } from '../components/quote/QuoteCorridorsTab'
import {
  ArrowLeft,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react'

export const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  // Quote data — fetched via TanStack Query
  // refetchOnWindowFocus is disabled because this component has its own
  // custom focus-refresh logic (AC-9) that compares versions and shows
  // a notification on external changes, rather than silently updating.
  const { data: quote, isLoading: isQuoteLoading, refetch: refetchQuote } = useQuoteQuery(id, {
    refetchOnWindowFocus: false,
  })

  // Tab + conflict state
  const [activeTab, setActiveTab] = useState<'overview' | 'corridors' | 'audit'>('overview')
  const [isConflict, setIsConflict] = useState(false)

  // Edit Mode State (AC-3)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPartner, setEditPartner] = useState('')
  const [editContractLength, setEditContractLength] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Audit trail refresh trigger — incremented after mutations so the
  // AuditTrail component re-fetches when the user visits the Audit tab.
  const [auditRefreshKey, setAuditRefreshKey] = useState(0)

  // Save mutation — updates quote fields with optimistic concurrency.
  // The hook's onSuccess sets the cache from the response (which includes
  // the incremented version). On 409 conflict, the mutation rejects and
  // the handler shows the conflict UI without updating the cache.
  const updateMutation = useUpdateQuoteMutation()
  // Submit mutation — transitions quote status to in_review.
  // The hook's onSuccess sets the cache from the response (which includes
  // the new status and recalculated financials). Submit does not use
  // version/concurrency checking — the backend only validates status.
  const submitMutation = useSubmitQuoteMutation()

  // Initialize edit fields when quote data loads or changes from the query cache.
  // This replaces the edit-field initialization that was previously inside fetchQuote.
  // The effect fires on initial load, after save/submit (cache update), and after
  // attach/detach (cache invalidation + refetch). It does NOT fire during editing
  // because the quote data doesn't change while the user is typing.
  useEffect(() => {
    if (quote) {
      setEditName(quote.name)
      setEditPartner(quote.partnerName)
      setEditContractLength(quote.contractLength ?? 1)
    }
  }, [quote])

  // AC-9: Detect external changes when the tab/window regains focus.
  // If another tab edited this quote, the version will differ and we
  // notify the user without overwriting their unsaved edits.
  //
  // This uses the query cache directly instead of local state. The
  // refetchOnWindowFocus option is disabled on useQuoteQuery to prevent
  // TanStack Query from silently updating the cache before this custom
  // logic can compare versions and show a notification.
  useEffect(() => {
    const handleFocus = () => {
      if (!id || isEditing) return
      quotesApi.getQuote(id).then((res) => {
        const current = queryClient.getQueryData<Quote>(queryKeys.quote(id))
        if (current && res.data.version !== current.version) {
          setNotification({
            type: 'error',
            message: `This quote was updated externally (v${current.version} → v${res.data.version}). Reloading the latest version.`,
          })
          setTimeout(() => setNotification(null), 5000)
          queryClient.setQueryData(queryKeys.quote(id), res.data)
        }
      }).catch(() => {
        // Ignore focus-refresh errors silently
      })
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id, isEditing, queryClient])

  // Save changes (AC-3)
  // Uses the useUpdateQuoteMutation hook which handles cache updates on
  // success. The payload includes `version` for optimistic concurrency —
  // the backend only updates if the version matches, otherwise it
  // returns 409 and the handler shows the conflict UI without updating
  // the cache or retrying.
  const handleSave = async () => {
    if (!quote || !id) return

    // Client-side validation — mirrors backend updateQuoteValidator (1..5)
    const clamped = Math.max(1, Math.min(5, Math.floor(Number(editContractLength) || 1)))

    setIsSaving(true)
    setNotification(null)

    try {
      // The mutation's onSuccess sets the query cache from the response
      // (which includes the incremented version) and invalidates quote
      // lists. The useEffect watching `quote` will reset edit fields
      // from the updated cache.
      await updateMutation.mutateAsync({
        id,
        payload: {
          name: editName,
          partnerName: editPartner,
          contractLength: clamped,
          version: quote.version,
        },
      })
      setIsEditing(false)
      setIsConflict(false)
      setNotification({ type: 'success', message: 'Quote updated successfully!' })
      setAuditRefreshKey((k) => k + 1)
      setTimeout(() => setNotification(null), 3000)
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Optimistic concurrency conflict — another user/tab modified
        // the quote. Do NOT overwrite server data, do NOT retry.
        // Show the conflict banner so the user can reload the latest
        // version and re-apply their changes.
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
  // Uses the useSubmitQuoteMutation hook which handles cache updates on
  // success. The backend only allows draft/rejected quotes to be submitted
  // (returns 422 otherwise). Submit does NOT use version/concurrency
  // checking — no 409 conflict handling needed.
  const handleSubmit = async () => {
    if (!quote || !id) return
    if (!window.confirm('Submit this quote for review? Editing will be locked once submitted.')) return

    setIsSubmitting(true)
    setNotification(null)

    try {
      // The mutation's onSuccess sets the query cache from the response
      // (which includes the new in_review status and recalculated
      // financials) and invalidates quote lists.
      await submitMutation.mutateAsync(id)
      setIsEditing(false)
      setAuditRefreshKey((k) => k + 1)
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
    <div style={{ minHeight: '100vh', paddingBottom: 60 }} data-cy="quote-details">
      <Navbar />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Quotes</span>
        </Link>

        {/* Notification Banner */}
        {notification && (
          <div className={`notification-banner ${notification.type === 'success' ? 'notification-success' : 'notification-error'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {isConflict && (
          <div className="notification-banner" data-cy="conflict-message" style={{ background: 'var(--conflict-bg)', border: '1px solid var(--conflict-border)', color: 'var(--conflict-text)' }}>
            <span>Another user changed this quote while you were editing it.</span>
            <button type="button" className="btn btn-secondary btn-sm" data-cy="conflict-reload" onClick={() => { setIsConflict(false); refetchQuote() }}>
              Reload Latest Version
            </button>
          </div>
        )}

        {/* Quote Header */}
        <QuoteHeader
          quote={quote}
          isEditable={isEditable}
          isEditing={isEditing}
          isSaving={isSaving}
          isSubmitting={isSubmitting}
          editName={editName}
          editPartner={editPartner}
          editContractLength={editContractLength}
          onEditNameChange={setEditName}
          onEditPartnerChange={setEditPartner}
          onEditContractLengthChange={setEditContractLength}
          onEditClick={() => setIsEditing(true)}
          onCancelEdit={() => {
            setIsEditing(false)
            setEditName(quote.name)
            setEditPartner(quote.partnerName)
            setEditContractLength(quote.contractLength ?? 1)
          }}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />

        {/* Main Tab Navigation */}
        <div className="tab-bar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            data-cy="tab-overview"
          >
            <Info size={16} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            className={`tab ${activeTab === 'corridors' ? 'tab-active' : ''}`}
            data-cy="tab-corridors"
          >
            <Layers size={16} />
            <span>Corridors</span>
            <span className="tab-count">{quote.corridorCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`tab ${activeTab === 'audit' ? 'tab-active' : ''}`}
            data-cy="tab-audit"
          >
            <Clock size={16} />
            <span>Audit History</span>
          </button>
        </div>

        {/* Tab: Corridors */}
        {activeTab === 'corridors' && (
          <QuoteCorridorsTab
            quoteId={id}
            isEditable={isEditable}
            onNotification={setNotification}
            onAuditRefresh={() => setAuditRefreshKey((k) => k + 1)}
          />
        )}

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <QuoteOverviewTab quote={quote} attachedCorridorCount={quote.corridorCount} />
        )}

        {/* Tab: Audit History */}
        {activeTab === 'audit' && (
          <section className="animate-fade-in">
            <AuditTrail quoteId={id!} refreshKey={auditRefreshKey} />
          </section>
        )}
      </main>
    </div>
  )
}
