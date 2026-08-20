import React from 'react'
import type { Quote, QuoteStatus } from '../../types/quote'
import { StatusBadge } from '../StatusBadge'
import {
  FileEdit,
  Save,
  Send,
  Lock,
  Building2,
  Calendar,
  RotateCcw,
} from 'lucide-react'


export interface QuoteHeaderProps {
  /** The fully-loaded quote object. */
  quote: Quote
  /** Whether the quote can be edited (status is 'draft' or 'rejected'). */
  isEditable: boolean
  /** Whether edit mode is currently active. */
  isEditing: boolean
  /** Whether a save operation is in progress. */
  isSaving: boolean
  /** Whether a submit-for-review operation is in progress. */
  isSubmitting: boolean

  // Edit form state (controlled by parent)
  editName: string
  editPartner: string
  editContractLength: number
  onEditNameChange: (value: string) => void
  onEditPartnerChange: (value: string) => void
  onEditContractLengthChange: (value: number) => void

  // Action callbacks (all logic lives in the parent)
  onEditClick: () => void
  onCancelEdit: () => void
  onSave: () => void
  onSubmit: () => void
}


export const QuoteHeader: React.FC<QuoteHeaderProps> = ({
  quote,
  isEditable,
  isEditing,
  isSaving,
  isSubmitting,
  editName,
  editPartner,
  editContractLength,
  onEditNameChange,
  onEditPartnerChange,
  onEditContractLengthChange,
  onEditClick,
  onCancelEdit,
  onSave,
  onSubmit,
}) => {
  return (
    <div className="glass-panel quote-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span className="quote-header-id">QUOTE #{quote.id}</span>
            <StatusBadge status={quote.status as QuoteStatus} />
            {!isEditable && (
              <span className="locked-badge">
                <Lock size={12} />
                <span>Read-Only</span>
              </span>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
              <input
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                placeholder="Quote Name"
                style={{ minWidth: 260 }}
                data-cy="edit-quote-name"
              />
              <input
                type="text"
                className="form-input"
                value={editPartner}
                onChange={(e) => onEditPartnerChange(e.target.value)}
                placeholder="Partner Name"
                style={{ minWidth: 220 }}
                data-cy="edit-quote-partner"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Contract Length (years)
                </label>
                <select
                  className="form-select"
                  value={editContractLength}
                  onChange={(e) => onEditContractLengthChange(Number(e.target.value))}
                  data-cy="edit-quote-contract-length"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} Year{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <h1 className="quote-header-title">{quote.name}</h1>
              <div className="quote-header-meta">
                <span className="quote-header-meta-item">
                  <Building2 size={14} color="var(--primary)" />
                  {quote.partnerName}
                </span>
                <span className="quote-header-meta-item">
                  <Calendar size={14} />
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {isEditable ? (
            isEditing ? (
              <>
                <button
                  onClick={onCancelEdit}
                  className="btn btn-secondary btn-sm"
                  data-cy="quote-cancel-edit"
                >
                  <RotateCcw size={14} />
                  <span>Cancel</span>
                </button>
                <button onClick={onSave} disabled={isSaving} className="btn btn-primary btn-sm" data-cy="quote-save">
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={onEditClick} className="btn btn-secondary btn-sm" data-cy="quote-edit">
                  <FileEdit size={14} />
                  <span>Edit</span>
                </button>
                <button onClick={onSubmit} disabled={isSubmitting} className="btn btn-success btn-sm" data-cy="quote-submit">
                  <Send size={14} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
                </button>
              </>
            )
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} />
              <span>Locked — {quote.status.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
