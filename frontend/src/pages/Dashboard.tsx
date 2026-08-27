import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { quotesApi } from '../api/quotesApi'
import type { Quote, QuoteStatus } from '../types/quote'
import { Navbar } from '../components/Navbar'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  FileText,
  PlusCircle,
  Search,
  Send,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  X,
  Building2,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [allQuotes, setAllQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [contractLength, setContractLength] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Loading guard to prevent duplicate API calls
  const isFetching = useRef(false)

  // Confirmation dialog state (replaces window.confirm)
  const [confirmState, setConfirmState] = useState<{
    title: string
    message: string
    confirmLabel: string
    danger: boolean
    action: () => void
  } | null>(null)

  const hasActiveFilters = search !== '' || statusFilter !== ''

  const handleResetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setStatusFilter('')
  }

  // Debounce search input — only fire API after user stops typing for 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchQuotes = async () => {
    if (isFetching.current) return
    isFetching.current = true
    try {
      setIsLoading(true)
      setFetchError(null)
      const res = await quotesApi.getQuotes({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      })
      setQuotes(res.data)
    } catch (err: any) {
      console.error(err)
      setFetchError(
        err.response?.data?.message ||
          'Failed to load quotes. Please try again.'
      )
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }

  // Fetch all quotes once on mount for accurate stats (independent of filters)
  useEffect(() => {
    quotesApi.getQuotes().then((res) => setAllQuotes(res.data)).catch(() => {})
  }, [])

  // Re-fetch when debounced search or status filter changes
  useEffect(() => {
    fetchQuotes()
  }, [debouncedSearch, statusFilter])

  const refreshAllQuotes = async () => {
    try {
      const res = await quotesApi.getQuotes()
      setAllQuotes(res.data)
    } catch {}
  }

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsCreating(true)

    try {
      await quotesApi.createQuote({ name, partnerName, contractLength })
      setIsModalOpen(false)
      setName('')
      setPartnerName('')
      setContractLength(1)
      await fetchQuotes()
      await refreshAllQuotes()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create quote')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmitQuote = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmState({
      title: 'Submit for Review',
      message: 'Submit this quote for review? Status will change to in_review.',
      confirmLabel: 'Submit',
      danger: false,
      action: async () => {
        try {
          await quotesApi.submitQuote(id)
          await fetchQuotes()
          await refreshAllQuotes()
        } catch (err: any) {
          alert(err.response?.data?.message || 'Submission failed')
        }
      },
    })
  }

  const handleDeleteQuote = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmState({
      title: 'Delete Quote',
      message: 'Are you sure you want to delete this quote? This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      action: async () => {
        try {
          await quotesApi.deleteQuote(id)
          await fetchQuotes()
          await refreshAllQuotes()
        } catch (err: any) {
          alert(err.response?.data?.message || 'Delete failed')
        }
      },
    })
  }

  // Calculate statistics from ALL quotes (not filtered) so stats stay accurate
  const stats = {
    total: allQuotes.length,
    draft: allQuotes.filter((q) => q.status === 'draft').length,
    in_review: allQuotes.filter((q) => q.status === 'in_review').length,
    approved: allQuotes.filter((q) => q.status === 'approved').length,
    rejected: allQuotes.filter((q) => q.status === 'rejected').length,
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <Navbar onNewQuote={() => setIsModalOpen(true)} />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Quotes Dashboard</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Manage commercial quotes, review cycles, and corridor fee structures
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            data-cy="header-create-quote"
          >
            <PlusCircle size={16} />
            <span>Create Quote</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Quotes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--text-warning)' }}>
              <FileEdit size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--text-warning)' }}>{stats.draft}</div>
              <div className="stat-label">Drafts (Editable)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.in_review}</div>
              <div className="stat-label">In Review (Locked)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--text-success)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--text-success)' }}>{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--text-danger)' }}>
              <XCircle size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--text-danger)' }}>{stats.rejected}</div>
              <div className="stat-label">Rejected (Re-editable)</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 460 }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 40 }}
              placeholder="Search by quote name or partner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Tabs + Reset */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: '', label: 'All' },
              { id: 'draft', label: 'Draft' },
              { id: 'in_review', label: 'In Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn btn-sm btn-secondary"
                title="Clear search and status filter"
                style={{ marginLeft: 4 }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {fetchError && !isLoading && (
          <div className="glass-panel" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--danger-light)', borderColor: 'var(--danger)' }}>
            <AlertCircle size={22} color="var(--text-danger)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-danger)', marginBottom: 2 }}>Failed to load quotes</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fetchError}</p>
            </div>
            <button onClick={fetchQuotes} className="btn btn-secondary btn-sm">
              <RotateCcw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Quotes List */}
        {isLoading ? (
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
            <p style={{ color: 'var(--text-muted)' }}>Loading quotes...</p>
          </div>
        ) : fetchError ? null : quotes.length === 0 ? (
          <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FileText size={26} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No Quotes Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              {hasActiveFilters ? 'No quotes match your current filters. Try adjusting or clearing them.' : 'Create your first commercial quote to start pricing corridors'}
            </p>
            {hasActiveFilters ? (
              <button onClick={handleResetFilters} className="btn btn-secondary">
                <RotateCcw size={16} />
                <span>Clear Filters</span>
              </button>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                <PlusCircle size={16} />
                <span>Create Quote</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {quotes.map((quote) => {
              const isEditable = quote.status === 'draft' || quote.status === 'rejected'

              return (
                <Link
                  key={quote.id}
                  to={`/quotes/${quote.id}`}
                  className="glass-card"
                  data-cy="quote-card"
                  data-cy-quote-id={quote.id}
                  style={{
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                        QUOTE #{quote.id}
                      </span>
                      <StatusBadge status={quote.status as QuoteStatus} size="sm" />
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
                      {quote.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                      <Building2 size={14} color="var(--primary)" />
                      <span>{quote.partnerName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12 }}>
                      <Calendar size={13} />
                      <span>Updated: {new Date(quote.updatedAt || quote.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Card Actions — stopPropagation so clicking buttons doesn't navigate */}
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    <span
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </span>

                    {isEditable && (
                      <button
                        onClick={(e) => handleSubmitQuote(quote.id, e)}
                        className="btn btn-success btn-sm"
                        title="Submit quote for review (AC-3)"
                        data-cy="quote-submit"
                      >
                        <Send size={13} />
                        <span>Submit</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteQuote(quote.id, e)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '7px 10px' }}
                      title="Delete quote"
                      data-cy="quote-delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Quote Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--modal-overlay)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: 32, position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Create New Quote</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Initial status will automatically be set to <strong>draft</strong> (AC-2)
            </p>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-light)',
                color: 'var(--text-danger)',
                fontSize: 13,
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuote}>
              <div className="form-group">
                <label className="form-label">Quote Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Q3 2026 Remittance Agreement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-cy="create-quote-name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Partner Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Wise Ltd., Banking Circle"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  data-cy="create-quote-partner"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Contract Length</label>
                <select
                  className="form-select"
                  value={contractLength}
                  onChange={(e) => setContractLength(Number(e.target.value))}
                  data-cy="create-quote-contract-length"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} Year{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
                  Affects Total Contract Value (TCV = annual revenue × years)
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  data-cy="create-quote-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary"
                  data-cy="create-quote-submit"
                >
                  {isCreating ? 'Creating...' : 'Create Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation dialog for submit/delete quote */}
      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ''}
        message={confirmState?.message ?? ''}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger}
        onConfirm={() => {
          confirmState?.action()
          setConfirmState(null)
        }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  )
}
