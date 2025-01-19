import type { HttpContext } from '@adonisjs/core/http'
import Plan from '#models/plan'
import { CreatePlanValidator, UpdatePlanValidator } from '#validators/plan'

export default class PlansController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const applicationId = request.input('applicationId')
    const isPublic = request.input('isPublic')

    const query = Plan.query()
      .preload('application')
      .preload('subscriptions')
      .orderBy('sortOrder', 'asc')

    if (applicationId) {
      query.where('applicationId', applicationId)
    }
    if (isPublic !== undefined) {
      query.where('isPublic', isPublic)
    }

    const plans = await query.paginate(page, limit)
    return response.json(plans)
  }

  async show({ params, response }: HttpContext) {
    const plan = await Plan.query()
      .where('id', params.id)
      .preload('application')
      .preload('subscriptions')
      .firstOrFail()

    return response.json(plan)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreatePlanValidator)
    const plan = await Plan.create(payload)
    
    await plan.load('application')
    return response.created(plan)
  }

  async update({ params, request, response }: HttpContext) {
    const plan = await Plan.findOrFail(params.id)
    const payload = await request.validate(UpdatePlanValidator)
    
    await plan.merge(payload).save()
    await plan.load('application')
    
    return response.json(plan)
  }

  async destroy({ params, response }: HttpContext) {
    const plan = await Plan.findOrFail(params.id)
    
    // Vérifier s'il y a des abonnements actifs
    const activeSubscriptions = await plan.related('subscriptions')
      .query()
      .where('status', 'ACTIVE')
      .count('* as count')

    if (Number(activeSubscriptions[0].$extras.count) > 0) {
      return response.badRequest({
        message: 'Ce plan ne peut pas être supprimé car il a des abonnements actifs'
      })
    }

    await plan.delete()
    return response.noContent()
  }

  async updateFeatures({ params, request, response }: HttpContext) {
    const plan = await Plan.findOrFail(params.id)
    const features = request.input('features')
    
    plan.features = { ...plan.features, ...features }
    await plan.save()
    
    return response.json(plan)
  }

  async updateLimits({ params, request, response }: HttpContext) {
    const plan = await Plan.findOrFail(params.id)
    const limits = request.input('limits')
    
    plan.limits = { ...plan.limits, ...limits }
    await plan.save()
    
    return response.json(plan)
  }

  async reorderPlans({ request, response }: HttpContext) {
    const { planOrders } = request.only(['planOrders'])
    
    for (const { id, sortOrder } of planOrders) {
      await Plan.query()
        .where('id', id)
        .update({ sortOrder })
    }
    
    return response.noContent()
  }
}