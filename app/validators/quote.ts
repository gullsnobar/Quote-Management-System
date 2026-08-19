import vine from '@vinejs/vine'

/**
 * Allowed quote statuses as defined by the project's lifecycle.
 * Used to validate the status query param on the quote index endpoint.
 */
export const QUOTE_STATUSES = ['draft', 'in_review', 'approved', 'rejected'] as const

export const createQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    partnerName: vine.string().trim().minLength(1).maxLength(255),
    contractLength: vine.number().min(1).max(5).optional().nullable(),
    version: vine.number().min(1).optional(),
  })
)

export const updateQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    partnerName: vine.string().trim().minLength(1).maxLength(255),
    contractLength: vine.number().min(1).max(5).optional().nullable(),
    version: vine.number().min(1).optional(),
  })
)

/**
 * Validates query params for GET /account/quotes (list + filter + search).
 *
 * - status: must be one of the defined quote statuses if provided
 * - search: free-text, trimmed, max 255 chars if provided
 */
export const listQuotesValidator = vine.compile(
  vine.object({
    status: vine.enum(QUOTE_STATUSES).optional(),
    search: vine.string().trim().minLength(1).maxLength(255).optional(),
  })
)

/**
 * Validates query params for GET /account/corridors (AC-4 filter section).
 *
 * All filters are optional strings, trimmed and length-capped to prevent
 * abuse and to keep PostgreSQL query plans stable.
 */
export const listCorridorsValidator = vine.compile(
  vine.object({
    region: vine.string().trim().minLength(1).maxLength(100).optional(),
    country: vine.string().trim().minLength(1).maxLength(100).optional(),
    transactionType: vine.string().trim().minLength(1).maxLength(50).optional(),
    service: vine.string().trim().minLength(1).maxLength(50).optional(),
    payoutCurrency: vine.string().trim().minLength(1).maxLength(10).optional(),
    receivingPartner: vine.string().trim().minLength(1).maxLength(200).optional(),
    payer: vine.string().trim().minLength(1).maxLength(200).optional(),
  })
)

/**
 * Validates the body for attaching/detaching corridors to a quote (AC-4).
 *
 * corridorIds must be a non-empty array of positive integers.
 */
export const attachCorridorsValidator = vine.compile(
  vine.object({
    corridorIds: vine.array(vine.number().positive()).minLength(1).maxLength(500),
  })
)
