export default class VerifyOrganizationMiddleware {
    async handle({ auth, response }: HttpContext, next: NextFn) {
      const user = auth.user
      if (!user?.organizationId) {
        return response.forbidden({ error: 'No organization associated with this user' })
      }
      return next()
    }
  }