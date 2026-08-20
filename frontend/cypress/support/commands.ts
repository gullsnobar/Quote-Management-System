/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>
    }
  }
}

const API_URL = Cypress.env('apiUrl') as string

Cypress.Commands.add('login', () => {
  cy.session(
    ['auth', Cypress.env('testUserEmail') as string],
    () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/login`,
        body: {
          email: Cypress.env('testUserEmail'),
          password: Cypress.env('testUserPassword'),
        },
        log: false,
      }).then((response) => {
        const { token, user } = response.body.data
        cy.window().then((win) => {
          win.localStorage.setItem('token', token)
          win.localStorage.setItem('user', JSON.stringify(user))
        })
      })
    },
    {
      validate() {
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.not.be.null
        })
      },
    },
  )
})

export {}
