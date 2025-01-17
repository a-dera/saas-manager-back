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
router.post('auth/login', '#controllers/auth_controller.login')
router.post('auth/register', '#controllers/auth_controller.register')

// Routes protégées
router.group(() => {
  // Auth routes
  router.post('auth/logout', '#controllers/auth_controller.logout')
  router.get('auth/me', '#controllers/auth_controller.me')
  
  // Users
  router.group(() => {
    router.resource('users', '#controllers/users_controller').apiOnly()
  }).middleware(['role_check:ADMIN,MANAGER'])
  
  // Organizations
  router.resource('organizations', '#controllers/organizations_controller').apiOnly()
  
  // Clients
  router.resource('clients', '#controllers/clients_controller').apiOnly()
  
  // Applications
  router.resource('applications', '#controllers/applications_controller').apiOnly()
  
  // Subscriptions
  router.resource('subscriptions', '#controllers/subscriptions_controller').apiOnly()
  router.post(
    'subscriptions/:id/renew',
    '#controllers/subscriptions_controller.renew'
  )
  router.post(
    'subscriptions/:id/cancel',
    '#controllers/subscriptions_controller.cancel'
  )
  
  // Transactions
  router.resource('transactions', '#controllers/transactions_controller').apiOnly()
  
  // Usage
  router.resource('usage', '#controllers/usage_controller').apiOnly()
  
  // Analytics
  router.get(
    'analytics/revenue',
    '#controllers/analytics_controller.revenueMetrics'
  )
  router.get(
    'analytics/clients',
    '#controllers/analytics_controller.clientMetrics'
  )
}).middleware(['auth'])