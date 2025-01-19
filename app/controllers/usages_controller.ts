import type { HttpContext } from '@adonisjs/core/http'
import Usage from '#models/usage'
import { CreateUsageValidator, UpdateUsageValidator } from '#validators/usage'
import { DateTime } from 'luxon'

export default class UsagesController {
    async index({ request, response }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)
        const subscriptionId = request.input('subscriptionId')
        const metric = request.input('metric')
        const startDate = request.input('startDate')
        const endDate = request.input('endDate')
    
        const query = Usage.query()
          .preload('subscription', (subscriptionQuery) => {
            subscriptionQuery.preload('client').preload('plan')
          })
    
        if (subscriptionId) {
          query.where('subscriptionId', subscriptionId)
        }
        if (metric) {
          query.where('metric', metric)
        }
        if (startDate && endDate) {
          query.whereBetween('date', [startDate, endDate])
        }
    
        const usages = await query.paginate(page, limit)
        return response.json(usages)
      }
    
      async show({ params, response }: HttpContext) {
        const usage = await Usage.query()
          .where('id', params.id)
          .preload('subscription', (subscriptionQuery) => {
            subscriptionQuery.preload('client').preload('plan')
          })
          .firstOrFail()
    
        return response.json(usage)
      }
    
      async store({ request, response }: HttpContext) {
        const payload = await request.validate(CreateUsageValidator)
        const usage = await Usage.create({
          ...payload,
          date: payload.date || DateTime.now()
        })
        
        await usage.load('subscription')
        
        // Mettre à jour les métriques d'utilisation de l'abonnement
        const subscription = await usage.subscription
        const currentMetrics = subscription.usageMetrics || {}
        subscription.usageMetrics = {
          ...currentMetrics,
          [usage.metric]: (currentMetrics[usage.metric] || 0) + usage.value
        }
        await subscription.save()
        
        return response.created(usage)
      }
    
      async update({ params, request, response }: HttpContext) {
        const usage = await Usage.findOrFail(params.id)
        const originalValue = usage.value
        const payload = await request.validate(UpdateUsageValidator)
        
        await usage.merge(payload).save()
        
        // Mettre à jour les métriques d'utilisation de l'abonnement
        if (payload.value !== originalValue) {
          const subscription = await usage.subscription
          const currentMetrics = subscription.usageMetrics || {}
          subscription.usageMetrics = {
            ...currentMetrics,
            [usage.metric]: (currentMetrics[usage.metric] || 0) - originalValue + usage.value
          }
          await subscription.save()
        }
        
        await usage.load('subscription')
        return response.json(usage)
      }
    
      async getMetricStats({ request, response }: HttpContext) {
        const subscriptionId = request.input('subscriptionId')
        const metric = request.input('metric')
        const startDate = request.input('startDate', DateTime.now().minus({ months: 1 }).toISODate())
        const endDate = request.input('endDate', DateTime.now().toISODate())
    
        const query = Usage.query()
          .where('metric', metric)
          .whereBetween('date', [startDate, endDate])
    
        if (subscriptionId) {
          query.where('subscriptionId', subscriptionId)
        }
    
        const usages = await query
        
        const stats = {
          totalUsage: usages.reduce((sum, usage) => sum + Number(usage.value), 0),
          averageUsage: usages.length > 0 
            ? usages.reduce((sum, usage) => sum + Number(usage.value), 0) / usages.length 
            : 0,
          maxUsage: Math.max(...usages.map(usage => Number(usage.value))),
          minUsage: Math.min(...usages.map(usage => Number(usage.value))),
          usageByDay: usages.reduce((acc, usage) => {
            const day = DateTime.fromJSDate(usage.date.toJSDate()).toISODate()
            acc[day] = (acc[day] || 0) + Number(usage.value)
            return acc
          }, {} as Record<string, number>)
        }
    
        return response.json(stats)
      }

  async bulkCreate({ request, response }: HttpContext) {
    const { usages } = request.only(['usages'])
    const createdUsages = await Usage.createMany(usages)
    
    // Mettre à jour les métriques d'utilisation des abonnements
    const subscriptionUpdates = new Map<string, Record<string, number>>()
    
    for (const usage of createdUsages) {
      if (!subscriptionUpdates.has(usage.subscriptionId)) {
        subscriptionUpdates.set(usage.subscriptionId, {})
      }
      
      const metrics = subscriptionUpdates.get(usage.subscriptionId)!
      metrics[usage.metric] = (metrics[usage.metric] || 0) + Number(usage.value)
    }

    // Appliquer les mises à jour aux abonnements
    for (const [subscriptionId, metrics] of subscriptionUpdates) {
      const subscription = await usage.subscription
      subscription.usageMetrics = {
        ...subscription.usageMetrics,
        ...Object.entries(metrics).reduce((acc, [metric, value]) => ({
          ...acc,
          [metric]: (subscription.usageMetrics[metric] || 0) + value
        }), {})
      }
      await subscription.save()
    }
    
    return response.created(createdUsages)
  }

  async deleteByDateRange({ request, response }: HttpContext) {
    const { startDate, endDate, subscriptionId, metric } = request.only([
      'startDate',
      'endDate',
      'subscriptionId',
      'metric'
    ])

    const query = Usage.query()
      .whereBetween('date', [startDate, endDate])

    if (subscriptionId) {
      query.where('subscriptionId', subscriptionId)
    }
    if (metric) {
      query.where('metric', metric)
    }

    await query.delete()
    return response.noContent()
  }
}