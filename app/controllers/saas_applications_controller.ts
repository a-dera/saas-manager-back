import type { HttpContext } from '@adonisjs/core/http'
import SaasApplication from '#models/saas_application'
import { CreateSaasApplicationValidator, UpdateSaasApplicationValidator } from '#validators/saas_application'

export default class SaasApplicationsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const organizationId = request.input('organizationId')

    const query = SaasApplication.query()
      .preload('organization')
      .preload('plans')
      .preload('applicationIntegrations')

    if (status) {
      query.where('status', status)
    }
    if (organizationId) {
      query.where('organizationId', organizationId)
    }

    const applications = await query.paginate(page, limit)
    return response.json(applications)
  }

  async show({ params, response }: HttpContext) {
    const application = await SaasApplication.query()
      .where('id', params.id)
      .preload('organization')
      .preload('plans')
      .preload('applicationIntegrations')
      .firstOrFail()

    return response.json(application)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateSaasApplicationValidator)
    const application = await SaasApplication.create(payload)
    
    await application.load((loader) => {
      loader.load('organization')
      loader.load('plans')
      loader.load('applicationIntegrations')
    })
    
    return response.created(application)
  }

  async update({ params, request, response }: HttpContext) {
    const application = await SaasApplication.findOrFail(params.id)
    const payload = await request.validate(UpdateSaasApplicationValidator)
    
    await application.merge(payload).save()
    await application.load((loader) => {
      loader.load('organization')
      loader.load('plans')
      loader.load('applicationIntegrations')
    })
    
    return response.json(application)
  }

  async destroy({ params, response }: HttpContext) {
    const application = await SaasApplication.findOrFail(params.id)
    
    // Vérifier s'il y a des plans avec des abonnements actifs
    const hasActiveSubscriptions = await application.related('plans')
      .query()
      .whereHas('subscriptions', (query) => {
        query.where('status', 'ACTIVE')
      })
      .first()

    if (hasActiveSubscriptions) {
      return response.badRequest({
        message: 'Cette application ne peut pas être supprimée car elle a des abonnements actifs'
      })
    }

    await application.delete()
    return response.noContent()
  }

  async updateMetrics({ params, request, response }: HttpContext) {
    const application = await SaasApplication.findOrFail(params.id)
    const metrics = request.input('metrics')
    
    application.metrics = { ...application.metrics, ...metrics }
    await application.save()
    
    return response.json(application)
  }

  async updateFeatures({ params, request, response }: HttpContext) {
    const application = await SaasApplication.findOrFail(params.id)
    const features = request.input('features')
    
    application.features = { ...application.features, ...features }
    await application.save()
    
    return response.json(application)
  }

  async getStats({ params, response }: HttpContext) {
    const application = await SaasApplication.query()
      .where('id', params.id)
      .preload('plans', (plansQuery) => {
        plansQuery.preload('subscriptions')
      })
      .firstOrFail()

    const stats = {
      totalPlans: application.plans.length,
      totalSubscriptions: application.plans.reduce(
        (sum, plan) => sum + plan.subscriptions.length,
        0
      ),
      activeSubscriptions: application.plans.reduce(
        (sum, plan) => sum + plan.subscriptions.filter(s => s.status === 'ACTIVE').length,
        0
      ),
      planDistribution: application.plans.map(plan => ({
        planName: plan.name,
        totalSubscriptions: plan.subscriptions.length,
        activeSubscriptions: plan.subscriptions.filter(s => s.status === 'ACTIVE').length
      }))
    }

    return response.json(stats)
  }
}