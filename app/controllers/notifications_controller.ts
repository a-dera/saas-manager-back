import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { CreateNotificationValidator } from '#validators/notification'

export default class NotificationsController {
  /**
   * Liste toutes les notifications
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const type = request.input('type')
    const status = request.input('status')

    const query = Notification.query()
      .preload('user')

    if (type) {
      query.where('type', type)
    }
    if (status) {
      query.where('status', status)
    }

    const notifications = await query.paginate(page, limit)
    return response.json(notifications)
  }

  /**
   * Récupère une notification spécifique
   */
  async show({ params, response }: HttpContext) {
    const notification = await Notification.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return response.json(notification)
  }

  /**
   * Crée une nouvelle notification
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateNotificationValidator)
    const notification = await Notification.create(payload)
    
    await notification.load('user')
    
    // Logique d'envoi de notification à implémenter selon le type
    await this.sendNotification(notification)
    
    return response.created(notification)
  }

  /**
   * Supprime une notification
   */
  async destroy({ params, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    await notification.delete()
    
    return response.noContent()
  }

  /**
   * Marque une notification comme envoyée
   */
  async markAsSent({ params, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    
    notification.status = 'SENT'
    notification.sentAt = new Date()
    await notification.save()
    
    return response.json(notification)
  }

  /**
   * Renvoie une notification qui a échoué
   */
  async retry({ params, response }: HttpContext) {
    const notification = await Notification.findOrFail(params.id)
    
    if (notification.status !== 'FAILED') {
      return response.badRequest({
        message: 'Seules les notifications échouées peuvent être renvoyées'
      })
    }

    notification.status = 'PENDING'
    await notification.save()
    
    // Réessayer l'envoi
    await this.sendNotification(notification)
    
    return response.json(notification)
  }

  /**
   * Méthode privée pour gérer l'envoi des notifications
   */
  private async sendNotification(notification: Notification) {
    try {
      switch (notification.type) {
        case 'EMAIL':
          // Implémenter l'envoi d'email
          break
        case 'SMS':
          // Implémenter l'envoi de SMS
          break
        case 'INAPP':
          // Implémenter la notification in-app
          break
      }
      
      notification.status = 'SENT'
      notification.sentAt = new Date()
    } catch (error) {
      notification.status = 'FAILED'
      notification.metadata = {
        ...notification.metadata,
        lastError: error.message,
        lastAttempt: new Date()
      }
    }
    
    await notification.save()
  }

  /**
   * Récupère les statistiques des notifications
   */
  async getStats({ response }: HttpContext) {
    const stats = await Notification.query()
      .select('status')
      .count('* as count')
      .groupBy('status')

    return response.json({
      stats,
      totalCount: stats.reduce((sum, stat) => sum + Number(stat.count), 0)
    })
  }
}