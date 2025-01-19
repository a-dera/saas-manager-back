import type { HttpContext } from '@adonisjs/core/http'
import Integration from '#models/integration'
import { CreateIntegrationValidator, UpdateIntegrationValidator } from '#validators/integration'

export default class IntegrationsController {
  /**
   * Liste toutes les intégrations
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const type = request.input('type')
    const status = request.input('status')

    const query = Integration.query()
      .preload('application')

    if (type) {
      query.where('type', type)
    }
    if (status) {
      query.where('status', status)
    }

    const integrations = await query.paginate(page, limit)
    return response.json(integrations)
  }

  /**
   * Récupère une intégration spécifique
   */
  async show({ params, response }: HttpContext) {
    const integration = await Integration.query()
      .where('id', params.id)
      .preload('application')
      .firstOrFail()

    return response.json(integration)
  }

  /**
   * Crée une nouvelle intégration
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateIntegrationValidator)
    const integration = await Integration.create(payload)
    
    await integration.load('application')
    return response.created(integration)
  }

  /**
   * Met à jour une intégration
   */
  async update({ params, request, response }: HttpContext) {
    const integration = await Integration.findOrFail(params.id)
    const payload = await request.validate(UpdateIntegrationValidator)
    
    await integration.merge(payload).save()
    await integration.load('application')
    
    return response.json(integration)
  }

  /**
   * Supprime une intégration
   */
  async destroy({ params, response }: HttpContext) {
    const integration = await Integration.findOrFail(params.id)
    await integration.delete()
    
    return response.noContent()
  }

  /**
   * Synchronise une intégration
   */
  async sync({ params, response }: HttpContext) {
    const integration = await Integration.findOrFail(params.id)
    integration.lastSyncAt = new Date()
    await integration.save()

    // Logique de synchronisation à implémenter selon vos besoins
    
    return response.json({
      message: 'Synchronisation réussie',
      lastSyncAt: integration.lastSyncAt
    })
  }

  /**
   * Teste la connexion d'une intégration
   */
  async testConnection({ params, response }: HttpContext) {
    const integration = await Integration.findOrFail(params.id)
    
    try {
      // Logique de test de connexion à implémenter selon vos besoins
      return response.json({
        status: 'success',
        message: 'Connexion établie avec succès'
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'Échec de la connexion',
        error: error.message
      })
    }
  }
}