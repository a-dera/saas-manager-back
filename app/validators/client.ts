import vine from '@vinejs/vine'

export const CreateClientValidator = vine.compile(
    vine.object({
      contact: vine.object({
        email: vine.string().email(),
        phone: vine.string().optional(),
        address: vine.string().optional()
      }),
      status: vine.enum(['ACTIVE', 'INACTIVE', 'PENDING']),
      customerSegment: vine.enum(['ENTERPRISE', 'SMB', 'STARTUP']),
      billingInfo: vine.object({
        paymentMethod: vine.string(),
        billingAddress: vine.string()
      }),
      customFields: vine.object({}),
      notes: vine.string().optional()
    })
  )