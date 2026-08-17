import React from 'react'
import type { QuoteStatus } from '../types/quote'
import { FileEdit, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: QuoteStatus
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'badge-draft',
          icon: <FileEdit size={size === 'sm' ? 12 : 14} />,
        }
      case 'in_review':
        return {
          label: 'In Review',
          className: 'badge-in_review',
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
        }
      case 'approved':
        return {
          label: 'Approved',
          className: 'badge-approved',
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
        }
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'badge-rejected',
          icon: <XCircle size={size === 'sm' ? 12 : 14} />,
        }
      default:
        return {
          label: status,
          className: 'badge-draft',
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
        }
    }
  }

  const { label, className, icon } = getStatusConfig()

  return (
    <span
      className={`badge ${className}`}
      style={{
        fontSize: size === 'sm' ? 11 : 12,
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  )
}
