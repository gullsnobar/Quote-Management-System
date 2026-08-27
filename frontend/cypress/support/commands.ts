/// <reference types="cypress" />

interface User {
  id: number
  fullName: string | null
  email: string
  createdAt?: string
  updatedAt?: string
}

interface AuthResponse {
  token: string
  user: User
}

interface LoginApiResponse {
  data: AuthResponse
}

interface CreateQuotePayload {
  name: string
  partnerName: string
  contractLength?: number
}

interface CypressEnv {
  apiUrl: string
  testUserEmail: string
  testUserPassword: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>
      authHeaders(): Chainable<{ Authorization: string }>
      createTestQuote(payload: CreateQuotePayload): Chainable<string>
      openBrowseCatalog(quoteId: string, options?: { waitForRows?: boolean }): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', () => {
  const env = Cypress.env() as CypressEnv

  cy.session(
    ['auth', env.testUserEmail],
    () => {
      cy.request<LoginApiResponse>({
        method: 'POST',
        url: `${env.apiUrl}/auth/login`,
        body: { email: env.testUserEmail, password: env.testUserPassword },
        log: false,
      }).then(({ body }) => {
        cy.window({ log: false }).then((win) => {
          win.localStorage.setItem('token', body.data.token)
          win.localStorage.setItem('user', JSON.stringify(body.data.user))
        })
      })
    },
    {
      validate() {
        cy.window({ log: false }).then((win) => {
          expect(win.localStorage.getItem('token'), 'auth token present').to.not.be.null
        })
      },
    },
  )
})

Cypress.Commands.add('authHeaders', () => {
  return cy.window({ log: false }).then((win) => {
    const token = win.localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
  })
})

Cypress.Commands.add('createTestQuote', (payload: CreateQuotePayload) => {
  const apiUrl = Cypress.env('apiUrl') as string
  return cy.authHeaders().then((headers) =>
    cy.request({
      method: 'POST',
      url: `${apiUrl}/account/quotes`,
      body: {
        name: payload.name,
        partnerName: payload.partnerName,
        contractLength: payload.contractLength ?? 1,
      },
      headers,
      log: false,
    })
  ).then((res) => String(res.body.data.id))
})

Cypress.Commands.add('openBrowseCatalog', (quoteId: string, options?: { waitForRows?: boolean }) => {
  const waitForRows = options?.waitForRows ?? true
  cy.visit(`/quotes/${quoteId}`)
  cy.get('[data-cy=quote-details]').should('be.visible')
  cy.get('[data-cy=tab-corridors]').click()
  cy.get('[data-cy=subtab-browse-catalog]').click()
  if (waitForRows) {
    cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 0)
  }
})

export {}
