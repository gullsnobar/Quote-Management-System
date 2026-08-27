describe('Frontend Error Handling', () => {
  beforeEach(() => {
    cy.login()
  })

  describe('401 Unauthorized session', () => {
    it('redirects to login when the token is expired/invalid', () => {
      cy.visit('/')
      cy.get('[data-cy=quote-card]').should('have.length.greaterThan', 0)

      cy.window().then((win) => {
        win.localStorage.setItem('token', 'invalid-expired-token')
      })

      cy.intercept('GET', '/api/v1/account/quotes*', {
        statusCode: 401,
        body: { message: 'Token expired' },
      }).as('expiredRequest')

      cy.reload()

      cy.url().should('include', '/login')
      cy.get('[data-cy=login-email]').should('be.visible')
    })

    it('shows a user-friendly error on login with invalid credentials (no stack trace)', () => {
      cy.window().then((win) => {
        win.localStorage.removeItem('token')
        win.localStorage.removeItem('user')
      })

      cy.intercept('POST', '/api/v1/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' },
      }).as('loginFail')

      cy.visit('/login')
      cy.get('[data-cy=login-email]').type('wrong@example.com')
      cy.get('[data-cy=login-password]').type('wrongpassword')
      cy.get('[data-cy=login-submit]').click()

      cy.get('[data-cy=auth-error]')
        .should('be.visible')
        .and('contain', 'Invalid credentials')

      cy.get('[data-cy=auth-error]').should('not.contain', 'at ')
      cy.get('[data-cy=auth-error]').should('not.contain', 'stack')
      cy.get('[data-cy=auth-error]').should('not.contain', 'Error:')
      cy.get('[data-cy=auth-error]').should('not.contain', 'undefined')

      cy.url().should('include', '/login')
    })
  })

  describe('404 Quote not found', () => {
    it('shows a not-found message with recovery link for a non-existent quote', () => {
      const nonExistentId = 999999

      cy.intercept('GET', `/api/v1/account/quotes/${nonExistentId}`, {
        statusCode: 404,
        body: { message: 'Quote not found' },
      }).as('notFound')

      cy.visit(`/quotes/${nonExistentId}`)

      cy.get('[data-cy=quote-details]').should('not.exist')

      cy.contains('h2', 'Quote Not Found').should('be.visible')
      cy.contains('This quote does not exist or you do not have permission to view it.').should('be.visible')

      cy.contains('a', 'Back to Dashboard').should('be.visible').click()
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`)
    })

    it('shows a user-friendly error in the audit trail for a missing quote', () => {
      const nonExistentId = 999998

      cy.intercept('GET', `/api/v1/account/quotes/${nonExistentId}/audit`, {
        statusCode: 404,
        body: { message: 'Quote not found' },
      }).as('auditNotFound')

      cy.intercept('GET', `/api/v1/account/quotes/${nonExistentId}`, {
        statusCode: 200,
        body: { data: { id: nonExistentId, name: 'Test', partnerName: 'Test', status: 'draft', version: 1, contractLength: 1, corridors: [], totalRevenue: 0, monthlyRevenue: 0, tcv: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
      }).as('quoteOk')

      cy.visit(`/quotes/${nonExistentId}`)
      cy.get('[data-cy=quote-details]').should('be.visible')
      cy.get('[data-cy=tab-audit]').click()

      cy.get('.notification-error')
        .should('be.visible')
        .and('contain', 'Quote not found or you do not have access to its audit trail.')

      cy.get('.notification-error').should('not.contain', 'stack')
      cy.get('.notification-error').should('not.contain', 'at ')
      cy.get('.notification-error').should('not.contain', 'SQL')
    })
  })

  describe('409 Conflict', () => {
    it('shows the conflict banner and does not overwrite server state', () => {
      const uniqueSuffix = `${Date.now()}`
      const quoteName = `Error Test ${uniqueSuffix}`
      const partnerName = `Error Partner ${uniqueSuffix}`

      cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
        cy.intercept('PUT', `/api/v1/account/quotes/${quoteId}`, {
          statusCode: 409,
          body: {
            success: false,
            code: 'QUOTE_CONFLICT',
            message: 'This quote was modified by another user. Please reload the latest version before saving.',
          },
        }).as('conflict')

        cy.visit(`/quotes/${quoteId}`)
        cy.get('[data-cy=quote-details]').should('be.visible')

        cy.get('[data-cy=quote-edit]').click()
        cy.get('[data-cy=edit-quote-name]').clear().type('Conflicting Update')
        cy.get('[data-cy=quote-save]').click()

        cy.wait('@conflict').its('response.statusCode').should('eq', 409)

        cy.get('[data-cy=conflict-message]')
          .should('be.visible')
          .and('contain', 'Another user changed this quote')

        cy.get('.notification-error').should('be.visible')
        cy.get('.notification-success').should('not.exist')

        cy.get('[data-cy=conflict-message]').should('not.contain', 'stack')
        cy.get('[data-cy=conflict-message]').should('not.contain', 'SQL')
        cy.get('.notification-error').should('not.contain', 'at ')

        cy.get('[data-cy=conflict-reload]').should('be.visible').click()
        cy.get('[data-cy=conflict-message]').should('not.exist')
      })
    })
  })

  describe('Network/API failure', () => {
    it('shows a user-friendly error with retry on the dashboard when the API is unreachable', () => {
      cy.intercept('GET', '/api/v1/account/quotes*', {
        forceNetworkError: true,
      }).as('networkFail')

      cy.visit('/')

      cy.contains('h3', 'Failed to load quotes').should('be.visible')
      cy.contains('button', 'Retry').should('be.visible')

      cy.get('body').should('not.contain', 'Network Error')
      cy.get('body').should('not.contain', 'ERR_')
      cy.get('body').should('not.contain', 'fetch')
      cy.get('body').should('not.contain', 'stack')

      cy.intercept('GET', '/api/v1/account/quotes*', (req) => {
        req.continue((res) => {
          expect(res.statusCode).to.eq(200)
        })
      }).as('recovery')

      cy.contains('button', 'Retry').click()
      cy.get('[data-cy=quote-card]').should('have.length.greaterThan', 0)
    })

    it('shows a user-friendly error when corridor attach fails with a server error', () => {
      const uniqueSuffix = `${Date.now()}`
      const quoteName = `Error Attach Test ${uniqueSuffix}`
      const partnerName = `Error Attach Partner ${uniqueSuffix}`

      cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
        cy.intercept('POST', `/api/v1/account/quotes/${quoteId}/corridors/attach`, {
          statusCode: 500,
          body: {},
        }).as('attachFail')

        cy.openBrowseCatalog(quoteId)

        cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="1"]`)
          .find('[data-cy=corridor-attach]')
          .click()

        cy.get('.notification-error')
          .should('be.visible')
          .and('contain', 'Failed to attach corridor')

        cy.get('.notification-error').should('not.contain', 'stack')
        cy.get('.notification-error').should('not.contain', 'at ')
        cy.get('.notification-error').should('not.contain', 'undefined')
        cy.get('.notification-error').should('not.contain', 'Error')

        cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="1"]`)
          .find('[data-cy=corridor-attach]')
          .should('be.visible')
      })
    })
  })

  describe('Loading state resolves correctly', () => {
    it('shows and dismisses the loading spinner on the quote details page', () => {
      const uniqueSuffix = `${Date.now()}`
      const quoteName = `Error Loading Test ${uniqueSuffix}`
      const partnerName = `Error Loading Partner ${uniqueSuffix}`

      cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
        cy.intercept('GET', `/api/v1/account/quotes/${quoteId}`, (req) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              req.reply({
                statusCode: 200,
                body: { data: { id: Number(quoteId), name: quoteName, partnerName, status: 'draft', version: 1, contractLength: 1, corridors: [], totalRevenue: 0, monthlyRevenue: 0, tcv: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
              })
              resolve(undefined)
            }, 500)
          })
        }).as('delayedQuote')

        cy.visit(`/quotes/${quoteId}`)

        cy.contains('Loading quote details...').should('be.visible')
        cy.get('[data-cy=quote-details]').should('not.exist')

        cy.wait('@delayedQuote')
        cy.get('[data-cy=quote-details]').should('be.visible')
        cy.contains('Loading quote details...').should('not.exist')
      })
    })
  })
})
