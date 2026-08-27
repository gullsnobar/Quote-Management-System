describe('smoke', () => {
  it('Cypress can visit the login page', () => {
    cy.visit('/login')
    cy.get('[data-cy=login-email]').should('be.visible')
  })
})
