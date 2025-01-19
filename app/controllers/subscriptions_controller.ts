import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import { CreateSubscriptionValidator, UpdateSubscriptionValidator } from '#validators/subscription'
import { DateTime } from 'luxon'

export default class SubscriptionsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const clientId = request.input('clientId')
    const planId = request.input('planId')

    const query = Subscription.query()
      .preload('client')
      .preload('plan', (planQuery) => {
        planQuery.preload('application')
      })
      .preload('transactions')
      .preload('usages')

    if (status) {
      query.where('status', status)
    }
    if (clientId) {
      query.where('clientId', clientId)
    }
    if (planId) {
      query.where('planId', planId)
    }

    const subscriptions = await query.paginate(page, limit)
    return response.json(subscriptions)
  }

  async show({ params, response }: HttpContext) {
    const subscription = await Subscription.query()
      .where('id', params.id)
      .preload('client')
      .preload('plan', (planQuery) => {
        planQuery.preload('application')
      })
      .preload('transactions')
      .preload('usages')
      .firstOrFail()

    return response.json(subscription)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateSubscriptionValidator)
    const subscription = await Subscription.create({
      ...payload,
      status: payload.status || 'PENDING',
      startDate: payload.startDate || DateTime.now(),
      endDate: this.calculateEndDate(payload.startDate || DateTime.now(), payload.billingCycle)
    })
    
    await subscription.load((loader) => {
      loader.load('client')
      loader.load('plan')
      loader.load('transactions')
    })
    
    return response.created(subscription)
  }

  async update({ params, request, response }: HttpContext) {
    const subscription = await Subscription.findOrFail(params.id)
    const payload = await request.validate(UpdateSubscriptionValidator)
    
    await subscription.merge(payload).save()
    await subscription.load((loader) => {
      loader.load('client')
      loader.load('plan')
      loader.load('transactions')
    })
    
    return response.json(subscription)
  }

  async cancel({ params, request, response }: HttpContext) {
    const subscription = await Subscription.findOrFail(params.id)
    const immediateEffect = request.input('immediateEffect', false)
    
    subscription.status = 'CANCELLED'
    subscription.cancelledAt = DateTime.now()
    
    if (immediateEffect) {
      subscription.endDate = DateTime.now()
    }
    
    await subscription.save()
    return response.json(subscription)
  }

  async renew({ params, response }: HttpContext) {
    const subscription = await Subscription.findOrFail(params.id)
    
    if (!subscription.autoRenew) {
      return response.badRequest({
        message: 'Le renouvellement automatique est désactivé pour cet abonnement'
      })
    }

    const currentEndDate = DateTime.fromJSDate(subscription.endDate.toJSDate())
    subscription.startDate = currentEndDate
    subscription.endDate = this.calculateEndDate(currentEndDate, subscription.billingCycle)
    subscription.status = 'ACTIVE'
    
    await subscription.save()
    return response.json(subscription)
  }

  async updateUsageMetrics({ params, request, response }: HttpContext) {
    const subscription = await Subscription.findOrFail(params.id)
    const metrics = request.input('usageMetrics')
    
    subscription.usageMetrics = { ...subscription.usageMetrics, ...metrics }
    await subscription.save()
    
    return response.json(subscription)
  }

  async getStats({ params, response }: HttpContext) {
    const subscription = await Subscription.query()
      .where('id', params.id)
      .preload('transactions')
      .preload('usages')
      .firstOrFail()

    const stats = {
      totalTransactions: subscription.transactions.length,
      totalAmount: subscription.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
      usageStats: subscription.usages.reduce((acc, usage) => {
        if (!acc[usage.metric]) {
          acc[usage.metric] = 0
        }
        acc[usage.metric] += Number(usage.value)
        return acc
      }, {} as Record<string, number>)
    }

    return response.json(stats)
  }

  private calculateEndDate(startDate: DateTime, billingCycle: 'MONTHLY' | 'YEARLY'): DateTime {
    return billingCycle === 'MONTHLY' 
      ? startDate.plus({ months: 1 })
      : startDate.plus({ years: 1 })
  }
}