import vine from '@vinejs/vine'

export const CreateSubscriptionValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    planId: vine.string().uuid(),
    startDate: vine.date(),
    endDate: vine.date(),
    status: vine.enum(['ACTIVE', 'CANCELLED', 'PENDING', 'TRIAL']),
    amount: vine.number().positive(),
    billingCycle: vine.enum(['MONTHLY', 'YEARLY']),
    autoRenew: vine.boolean(),
    trialEndsAt: vine.date().optional(),
    customDiscounts: vine.object({}).optional()
  })
)

export const UpdateSubscriptionValidator = createSubscriptionValidator.extend({
  status: vine.enum(['ACTIVE', 'CANCELLED', 'TRIAL']).optional(),
  trialEndsAt: vine.date().optional()
})

export const CreatePaymentValidator = vine.compile(
  vine.object({
    subscriptionId: vine.string().uuid(),
    amount: vine.number().positive(),
    currency: vine.string().length(3),
    paymentMethod: vine.string(),
    metadata: vine.object().optional()
  })
)

export const CreateInvoiceValidator = vine.compile(
  vine.object({
    subscriptionId: vine.string().uuid(),
    amount: vine.number().positive(),
    currency: vine.string().length(3),
    dueDate: vine.date(),
    metadata: vine.object().optional()
  })
)
