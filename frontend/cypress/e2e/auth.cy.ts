describe('Authentication', () => {
  const email = Cypress.env('testUserEmail') as string
  const password = Cypress.env('testUserPassword') as string

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('login page loads with the login form', () => {
    cy.visit('/login')
    cy.get('[data-cy=login-email]').should('be.visible')
    cy.get('[data-cy=login-password]').should('be.visible')
    cy.get('[data-cy=login-submit]').should('be.visible').and('not.be.disabled')
  })

  it('allows a valid test user to log in', () => {
    cy.visit('/login')
    cy.get('[data-cy=login-email]').type(email)
    cy.get('[data-cy=login-password]').type(password, { log: false })
    cy.get('[data-cy=login-submit]').click()

    cy.url().should('eq', `${Cypress.config('baseUrl')}/`)
    cy.contains('h1', 'Quotes Dashboard').should('be.visible')
  })

  it('shows a user-friendly error for invalid credentials', () => {
    cy.visit('/login')
    cy.get('[data-cy=login-email]').type(email)
    cy.get('[data-cy=login-password]').type('wrong_password_123', { log: false })
    cy.get('[data-cy=login-submit]').click()

    cy.get('[data-cy=auth-error]')
      .should('be.visible')
      .and('not.be.empty')
    cy.url().should('include', '/login')
  })

  it('allows an authenticated user to access the application', () => {
    cy.login()
    cy.visit('/')
    cy.contains('h1', 'Quotes Dashboard').should('be.visible')
  })

  it('logs the user out via the profile page', () => {
    cy.login()
    cy.visit('/profile')

    cy.get('[data-cy=logout-button]').should('be.visible')
    cy.on('window:confirm', () => true)
    cy.get('[data-cy=logout-button]').click()

    cy.url().should('include', '/login')
    cy.get('[data-cy=login-submit]').should('be.visible')
  })

  it('redirects unauthenticated users from protected quote routes to login', () => {
    cy.visit('/quotes/999999')
    cy.url().should('include', '/login')
    cy.get('[data-cy=login-email]').should('be.visible')
  })
})
