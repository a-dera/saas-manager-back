import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types'
import { AuthenticationException } from '@adonisjs/auth/exceptions'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()
    if (!user) {
      throw new AuthenticationException('Unauthorized access', 401)
    }
    return next()
  }
}