/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    // =========================================================
    // PUBLIC AUTH ROUTES
    // =========================================================
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    // =========================================================
    // AUTHENTICATED ROUTES
    // =========================================================
    router
      .group(() => {
        // Account
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])

        // Quotes
        router.get('quotes', [controllers.Quotes, 'index'])
        router.post('quotes', [controllers.Quotes, 'store'])
        router.get('quotes/:id', [controllers.Quotes, 'show'])
        router.put('quotes/:id', [controllers.Quotes, 'update'])
        router.delete('quotes/:id', [controllers.Quotes, 'destroy'])
        router.post('quotes/:id/submit', [controllers.Quotes, 'submit'])

        // Quote ↔ Corridor management (AC-4)
        router.get('quotes/:id/corridors', [controllers.Quotes, 'corridors'])
        router.post('quotes/:id/corridors/attach', [controllers.Quotes, 'attachCorridors'])
        router.post('quotes/:id/corridors/detach', [controllers.Quotes, 'detachCorridors'])

        // Quote audit trail (AC-11)
        router.get('quotes/:id/audit', [controllers.Quotes, 'auditTrail'])

        // Corridors
        router.get('corridors', [controllers.Corridors, 'index'])
        router.get('corridors/:id', [controllers.Corridors, 'show'])
      })
      .prefix('account')
      .as('account')
      .use(middleware.auth())
  })
  .prefix('/api/v1')