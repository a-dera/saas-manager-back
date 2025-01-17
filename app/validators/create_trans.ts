import vine from '@vinejs/vine'

export default vine.compile(
  vine.object({
    subscriptionId: vine.string().uuid(),
    amount: vine.number().positive(),
    currency: vine.string().length(3),
    paymentMethod: vine.string(),
    metadata: vine.object().optional()
  })
)