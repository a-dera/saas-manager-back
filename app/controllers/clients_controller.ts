import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { CreateClientValidator, UpdateClientValidator } from '#validators/client'

export default class ClientsController {
  /**
   * Récupère la liste des clients avec pagination
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const segment = request.input('customerSegment')

    const query = Client.query()
      .preload('organization')
      .preload('subscriptions')

    if (status) {
      query.where('status', status)
    }
    if (segment) {
      query.where('customerSegment', segment)
    }

    const clients = await query.paginate(page, limit)
    return response.json(clients)
  }

  /**
   * Récupère un client spécifique
   */
  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('organization')
      .preload('subscriptions')
      .firstOrFail()

    return response.json(client)
  }

  /**
   * Crée un nouveau client
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateClientValidator)
    const client = await Client.create(payload)
    
    await client.load('organization')
    return response.created(client)
  }

  /**
   * Met à jour un client existant
   */
  async update({ params, request, response }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    const payload = await request.validate(UpdateClientValidator)
    
    await client.merge(payload).save()
    await client.load('organization')
    
    return response.json(client)
  }

  /**
   * Supprime un client
   */
  async destroy({ params, response }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    await client.delete()
    
    return response.noContent()
  }

  /**
   * Change le statut d'un client
   */
  async updateStatus({ params, request, response }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    const status = request.input('status')
    
    if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
      return response.badRequest({ message: 'Statut invalide' })
    }
    
    client.status = status
    await client.save()
    
    return response.json(client)
  }

  /**
   * Récupère les statistiques d'un client
   */
  async getStats({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('subscriptions')
      .firstOrFail()

    const stats = {
      totalSubscriptions: client.subscriptions.length,
      activeSubscriptions: client.subscriptions.filter(s => s.status === 'ACTIVE').length,
      totalRevenue: client.subscriptions.reduce((sum, s) => sum + Number(s.amount), 0)
    }

    return response.json(stats)
  }
}