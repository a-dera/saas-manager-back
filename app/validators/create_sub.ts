import vine from '@vinejs/vine'

export default vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    planId: vine.string().uuid(),
    startDate: vine.date(),
    billingCycle: vine.enum(['MONTHLY', 'YEARLY']),
    autoRenew: vine.boolean(),
    customDiscounts: vine.object().optional()
  })
)