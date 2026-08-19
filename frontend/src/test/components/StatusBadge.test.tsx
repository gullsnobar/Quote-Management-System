import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../../components/StatusBadge'

describe('StatusBadge', () => {
  it('renders the correct label for draft status', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders the correct label for in_review status', () => {
    render(<StatusBadge status="in_review" />)
    expect(screen.getByText('In Review')).toBeInTheDocument()
  })

  it('renders the correct label for approved status', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders the correct label for rejected status', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('applies the correct CSS class for each status', () => {
    const { container, rerender } = render(<StatusBadge status="draft" />)
    const badge = container.querySelector('.badge')
    expect(badge).toHaveClass('badge-draft')

    rerender(<StatusBadge status="in_review" />)
    expect(container.querySelector('.badge')).toHaveClass('badge-in_review')

    rerender(<StatusBadge status="approved" />)
    expect(container.querySelector('.badge')).toHaveClass('badge-approved')

    rerender(<StatusBadge status="rejected" />)
    expect(container.querySelector('.badge')).toHaveClass('badge-rejected')
  })

  it('falls back to the raw status string for unknown statuses', () => {
    // @ts-expect-error testing unknown status
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })
})
