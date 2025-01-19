import vine from '@vinejs/vine'

export const CreateNotificationValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(100),
    content: vine.string().trim().minLength(2).maxLength(100),
    type: vine.enum(['INFO', 'WARNING', 'ERROR']),
    organizationId: vine.string().trim().minLength(2).maxLength(100)
  })
)

export const UpdateNotificationValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(100).optional(),
    content: vine.string().trim().minLength(2).maxLength(100).optional(),
    type: vine.enum(['INFO', 'WARNING', 'ERROR']).optional(),
    organizationId: vine.string().trim().minLength(2).maxLength(100).optional()
  })
)
