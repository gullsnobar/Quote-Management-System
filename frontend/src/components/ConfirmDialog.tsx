import React, { useEffect } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'

/**
 * Props for the ConfirmDialog component.
 *
 * A reusable confirmation modal that replaces window.confirm() across
 * the app. Renders a centered dialog over a blurred backdrop, following
 * the same overlay pattern as the Create Quote modal on the Dashboard.
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  open: boolean
  /** Dialog title (defaults to "Are you sure?"). */
  title?: string
  /** The confirmation message shown to the user. */
  message: string
  /** Label for the confirm button (defaults to "Confirm"). */
  confirmLabel?: string
  /** Label for the cancel button (defaults to "Cancel"). */
  cancelLabel?: string
  /** Use danger styling for destructive actions (red confirm button). */
  danger?: boolean
  /** Called when the user confirms the action. */
  onConfirm: () => void
  /** Called when the user cancels (button, backdrop click, or Escape). */
  onCancel: () => void
}

/**
 * Centered confirmation modal with a blurred backdrop.
 * Cancels on Escape key or backdrop click; confirms only via the button.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      onClick={onCancel}
      data-cy="confirm-dialog"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--modal-overlay)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 20,
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: '100%', maxWidth: 420, padding: 28, textAlign: 'center' }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: danger ? 'var(--danger-light)' : 'var(--primary-light)',
            color: danger ? 'var(--text-danger)' : 'var(--primary)',
          }}
        >
          {danger ? <AlertTriangle size={26} /> : <HelpCircle size={26} />}
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ minWidth: 110 }}
            data-cy="confirm-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            style={{ minWidth: 110 }}
            data-cy="confirm-ok"
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
