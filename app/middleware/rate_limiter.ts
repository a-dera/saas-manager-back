import { rateLimiter } from '@adonisjs/limiter/rate_limiter'

export default class RateLimiterMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const limiter = rateLimiter.create('api')
      .pointsPerMinute(100)
      .blockDuration('30 mins')
    
    await limiter.allow(ctx)
    return next()
  }
}