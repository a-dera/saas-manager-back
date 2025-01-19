import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.compile(
  vine.object({
    type: vine.enum(['COMPANY', 'INDIVIDUAL']),
    address: vine.object({
      street: vine.string(),
      city: vine.string(),
      country: vine.string(),
      postalCode: vine.string()
    }),
    billingEmail: vine.string().email(),
    vatNumber: vine.string().optional(),
    settings: vine.object({})
  })
)

export const updateOrganizationValidator = vine.compile(
  vine.object({
    type: vine.enum(['COMPANY', 'INDIVIDUAL']).optional(),
    address: vine.object({
      street: vine.string().optional(),
      city: vine.string().optional(),
      country: vine.string().optional(),
      postalCode: vine.string().optional()
    }).optional(),
    billingEmail: vine.string().email().optional(),
    vatNumber: vine.string().optional(),
    settings: vine.object().optional()
  })
)