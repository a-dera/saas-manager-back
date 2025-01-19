import type { HttpContext } from '@adonisjs/core/http'
import Organization from '#models/organization'
import { CreateOrganizationValidator, UpdateOrganizationValidator } from '#validators/organization'

export default class OrganizationsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const type = request.input('type')

    const query = Organization.query()
      .preload('users')
      .preload('clients')
      .preload('applications')

    if (type) {
      query.where('type', type)
    }

    const organizations = await query.paginate(page, limit)
    return response.json(organizations)
  }

  async show({ params, response }: HttpContext) {
    const organization = await Organization.query()
      .where('id', params.id)
      .preload('users')
      .preload('clients')
      .preload('applications', (query) => {
        query.preload('plans')
      })
      .firstOrFail()

    return response.json(organization)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validate(CreateOrganizationValidator)
    const organization = await Organization.create(payload)
    
    await organization.load('users')
    return response.created(organization)
  }

  async update({ params, request, response }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    const payload = await request.validate(UpdateOrganizationValidator)
    
    await organization.merge(payload).save()
    await organization.load('users')
    
    return response.json(organization)
  }

  async destroy({ params, response }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    await organization.delete()
    
    return response.noContent()
  }

  async getStats({ params, response }: HttpContext) {
    const organization = await Organization.query()
      .where('id', params.id)
      .preload('clients')
      .preload('applications')
      .preload('users')
      .firstOrFail()

    const stats = {
      totalUsers: organization.users.length,
      totalClients: organization.clients.length,
      totalApplications: organization.applications.length,
      usersByRole: organization.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return response.json(stats)
  }

  async updateSettings({ params, request, response }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    const settings = request.input('settings')
    
    organization.settings = { ...organization.settings, ...settings }
    await organization.save()
    
    return response.json(organization)
  }
}