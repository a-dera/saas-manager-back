/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel'

// router.get('/', async () => {
//   return {
//     hello: 'world',
//   }
// })

// Routes publiques
router.post('api/auth/login', '#controllers/users_controller.login')
router.post('api/auth/register', '#controllers/auth_controller.register')

// Routes protégées
router.group(() => {
  // Organizations
  router
    .group(() => {
      router.get('/', 'OrganizationsController.index')
      router.post('/', 'OrganizationsController.store')
      router.get('/:id', 'OrganizationsController.show')
      router.put('/:id', 'OrganizationsController.update')
      router.delete('/:id', 'OrganizationsController.destroy')
    })
    .prefix('/api/organizations')
    .middleware(['auth', 'verifyAdmin'])

  // Clients
  router
    .group(() => {
      router.get('/', 'ClientsController.index')
      router.post('/', 'ClientsController.store')
      router.get('/:id', 'ClientsController.show')
      router.put('/:id', 'ClientsController.update')
      router.delete('/:id', 'ClientsController.destroy')
      router.get('/:id/subscriptions', 'ClientsController.getSubscriptions')
    })
    .prefix('/api/clients')
    .middleware(['auth', 'verifyOrganization'])

  // Subscriptions
  router
    .group(() => {
      router.get('/', 'SubscriptionsController.index')
      router.post('/', 'SubscriptionsController.store')
      router.get('/:id', 'SubscriptionsController.show')
      router.put('/:id', 'SubscriptionsController.update')
      router.delete('/:id', 'SubscriptionsController.destroy')
      router.post('/:id/renew', 'SubscriptionsController.renew')
      router.post('/:id/cancel', 'SubscriptionsController.cancel')
    })
    .prefix('/api/subscriptions')
    .middleware(['auth', 'verifyOrganization'])

  // SaaS Applications
  router
    .group(() => {
      router.get('/', 'SaasApplicationsController.index')
      router.post('/', 'SaasApplicationsController.store')
      router.get('/:id', 'SaasApplicationsController.show')
      router.put('/:id', 'SaasApplicationsController.update')
      router.delete('/:id', 'SaasApplicationsController.destroy')
      router.get('/:id/metrics', 'SaasApplicationsController.getMetrics')
    })
    .prefix('/api/applications')
    .middleware(['auth', 'verifyAdmin'])
}).middleware(['api'])