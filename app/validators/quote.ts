import vine from '@vinejs/vine'

export const createQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    partnerName: vine.string().trim().minLength(1).maxLength(255),
    contractLength: vine.number().min(1).max(5).optional().nullable(),
  })
)

export const updateQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    partnerName: vine.string().trim().minLength(1).maxLength(255),
    contractLength: vine.number().min(1).max(5).optional().nullable(),
  })
)