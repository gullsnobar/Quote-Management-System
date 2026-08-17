import vine from '@vinejs/vine'

export const createQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),

    partnerName: vine.string().trim().minLength(1).maxLength(255),
  })
)

export const updateQuoteValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),

    partnerName: vine.string().trim().minLength(1).maxLength(255),
  })
)