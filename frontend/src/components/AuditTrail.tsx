import React, { useCallback, useEffect, useState } from 'react'
import { quotesApi } from '../api/quotesApi'
import type { AuditLogEntry } from '../types/quote'
import {
  FileEdit,
  FilePlus2,
  Send,
  Trash2,
  Link2,
  Unlink,
  Clock,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react'

/**
 * Maps an audit action string to a display label, icon, and color.
 *
 * Action names are defined in AuditLogService.ACTIONS on the backend:
 *   quote.created, quote.updated, quote.submitted, quote.deleted,
 *   quote.corridors.attached, quote.corridors.detached
 */
const ACTION_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  'quote.created': {
    label: 'Quote Created',
    icon: <FilePlus2 size={12} />,
    color: 'var(--text-success)',
    bg: 'var(--success-light)',
  },
  'quote.updated': {
    label: 'Quote Updated',
    icon: <FileEdit size={12} />,
    color: 'var(--primary)',
    bg: 'var(--primary-light)',
  },
  'quote.submitted': {
    label: 'Submitted for Review',
    icon: <Send size={12} />,
    color: 'var(--cyan)',
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  'quote.deleted': {
    label: 'Quote Deleted',
    icon: <Trash2 size={12} />,
    color: 'var(--text-danger)',
    bg: 'var(--danger-light)',
  },
  'quote.corridors.attached': {
    label: 'Corridors Attached',
    icon: <Link2 size={12} />,
    color: 'var(--text-success)',
    bg: 'var(--success-light)',
  },
  'quote.corridors.detached': {
    label: 'Corridors Detached',
    icon: <Unlink size={12} />,
    color: 'var(--text-danger)',
    bg: 'var(--danger-light)',
  },
}

const UNKNOWN_ACTION = {
  label: 'Unknown Action',
  icon: <AlertCircle size={12} />,
  color: 'var(--text-muted)',
  bg: 'var(--bg-surface)',
}

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { ...UNKNOWN_ACTION, label: action }
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatMetadata(metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null
  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return null
  }
}

interface AuditTrailProps {
  quoteId: number | string
  /**
   * Optional refresh trigger — when this number changes, the audit trail
   * is re-fetched. Used to refresh after attach/detach/save operations.
   */
  refreshKey?: number
}

/**
 * Renders the audit trail for a quote as a vertical timeline.
 *
 * Data is owner-scoped on the backend: only the quote owner can view
 * the audit trail (GET /account/quotes/:id/audit).
 */
export const AuditTrail: React.FC<AuditTrailProps> = ({ quoteId, refreshKey = 0 }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditTrail = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await quotesApi.getAuditTrail(quoteId)
      setEntries(res.data)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } }
      if (e.response?.status === 404) {
        setError('Quote not found or you do not have access to its audit trail.')
      } else {
        setError(e.response?.data?.message || 'Failed to load audit trail.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [quoteId])

  useEffect(() => {
    fetchAuditTrail()
  }, [fetchAuditTrail, refreshKey])

  if (isLoading) {
    return (
      <div className="glass-panel empty-state">
        <div className="loading-spinner" />
        <p className="empty-state-text">Loading audit trail...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="notification-banner notification-error">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <div className="empty-state-icon" style={{ background: 'var(--bg-surface)', color: 'var(--text-dim)' }}>
          <Clock size={24} />
        </div>
        <h4 className="empty-state-title">No Activity Recorded</h4>
        <p className="empty-state-text">
          Actions taken on this quote (create, edit, submit, corridor changes) will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel" style={{ padding: 24 }} data-cy="audit-trail">
      <div className="section-header">
        <div className="section-header-icon"><Clock size={18} /></div>
        <div>
          <div className="section-header-title">Activity History</div>
          <div className="section-header-subtitle">
            {entries.length} event{entries.length !== 1 ? 's' : ''} · Most recent first
          </div>
        </div>
      </div>

      <div className="audit-timeline">
        {entries.map((entry) => {
          const meta = getActionMeta(entry.action)
          const metadataStr = formatMetadata(entry.metadata)
          return (
            <div key={entry.id} className="audit-entry" data-cy="audit-entry" data-cy-action={entry.action}>
              <div
                className="audit-entry-marker"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.icon}
              </div>

              <div className="audit-entry-header">
                <span
                  className="audit-action-badge"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                  {meta.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {formatTimestamp(entry.createdAt)}
                </span>
              </div>

              <div className="audit-entry-meta">
                {entry.user && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <UserIcon size={12} />
                    {entry.user.fullName || entry.user.email}
                  </span>
                )}
              </div>

              {metadataStr && (
                <div className="audit-entry-detail">{metadataStr}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
