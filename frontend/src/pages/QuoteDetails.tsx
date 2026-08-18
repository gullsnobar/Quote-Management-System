import React, { useEffect, useState } from 'react'
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

  // Fetch Corridors (with all active filters)
  const fetchCorridors = async () => {
    try {
      setIsCorridorsLoading(true)
      const res = await corridorsApi.getCorridors(filters)
      setCorridors(res.data)
      setCorridorsCount(res.count)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsCorridorsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [id])

  useEffect(() => {
    if (activeTab === 'corridors') {
      fetchCorridors()
    }
  }, [activeTab, filters])

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
            color: notification.type === 'success' ? '#34d399' : '#f87171',
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
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fbbf24',
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
                    background: 'rgba(148, 163, 184, 0.1)',
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
              background: 'rgba(255, 255, 255, 0.2)',
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
            {/* Filters Bar */}
            <CorridorFilters
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters({})}
              totalCount={3000}
              filteredCount={corridorsCount}
              isLoading={isCorridorsLoading}
            />

            {/* Corridors Table */}
            <CorridorsTable
              corridors={corridors}
              isLoading={isCorridorsLoading}
            />
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
