import vine from '@vinejs/vine'

export default vine.compile(
  vine.object({
    email: vine.string().email().unique('users,email'),
    password: vine.string().minLength(8),
    firstName: vine.string().minLength(2),
    lastName: vine.string().minLength(2),
    role: vine.enum(['ADMIN', 'MANAGER', 'SUPPORT']),
    phoneNumber: vine.string().optional(),
    organizationId: vine.string().uuid()
  })
)