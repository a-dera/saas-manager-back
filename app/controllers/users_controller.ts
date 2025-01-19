import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { CreateUserValidator, UpdateUserValidator, LoginValidator } from '#validators/user'
// import CreateUserValidator from '#validators/user'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class UsersController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const role = request.input('role')
    const status = request.input('status')
    const organizationId = request.input('organizationId')

    const query = User.query()
      .preload('organization')
      .preload('notifications')

    if (role) {
      query.where('role', role)
    }
    if (status) {
      query.where('status', status)
    }
    if (organizationId) {
      query.where('organizationId', organizationId)
    }

    const users = await query.paginate(page, limit)
    return response.json(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('organization')
      .preload('notifications')
      .firstOrFail()

    return response.json(user)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateUserValidator)
    const hashedPassword = await hash.make(payload.password)
    
    const user = await User.create({
      ...payload,
      password: hashedPassword,
      status: payload.status || 'ACTIVE'
    })
    
    await user.load('organization')
    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validate(UpdateUserValidator)
    
    if (payload.password) {
      payload.password = await hash.make(payload.password)
    }
    
    await user.merge(payload).save()
    await user.load('organization')
    
    return response.json(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    
    return response.noContent()
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validate(LoginValidator)
    
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    user.lastLoginAt = DateTime.now()
    await user.save()
    
    return response.json({
      user,
      token: token.value,
      type: 'bearer'
    })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('api').logout()
    return response.noContent()
  }

  async toggleTwoFactor({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    user.twoFactorEnabled = !user.twoFactorEnabled
    await user.save()
    
    return response.json(user)
  }

  async updateStatus({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const status = request.input('status')
    
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return response.badRequest({ message: 'Statut invalide' })
    }
    
    user.status = status
    await user.save()
    
    return response.json(user)
  }

  async getCurrentUser({ auth, response }: HttpContext) {
    const user = auth.user!
    await user.load((loader) => {
      loader.load('organization')
      loader.load('notifications', (query) => {
        query.where('status', 'PENDING')
      })
    })
    
    return response.json(user)
  }

  async getStats({ params, response }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('notifications')
      .firstOrFail()

    const stats = {
      totalNotifications: user.notifications.length,
      notificationsByStatus: user.notifications.reduce((acc, notif) => {
        acc[notif.status] = (acc[notif.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      lastLogin: user.lastLoginAt,
      accountAge: DateTime.now().diff(user.createdAt, ['days']).toObject()
    }

    return response.json(stats)
  }

  async resetPassword({ request, response }: HttpContext) {
    // Implémentation du reset password à faire selon vos besoins
    // Généralement avec envoi d'email et token de réinitialisation
    return response.json({ message: 'Fonctionnalité à implémenter' })
  }
}