import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types'

export default class RoleCheckMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    allowedRoles: string[]
  ) {
    const user = auth.user!
    
    if (!allowedRoles.includes(user.role)) {
      return response.forbidden({ 
        message: 'You do not have permission to access this resource' 
      })
    }

    return next()
  }
}