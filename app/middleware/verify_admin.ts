export default class VerifyAdminMiddleware {
    async handle({ auth, response }: HttpContext, next: NextFn) {
      const user = auth.user
      if (user?.role !== 'ADMIN') {
        return response.forbidden({ error: 'Admin access required' })
      }
      return next()
    }
  }