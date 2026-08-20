describe('smoke', () => {
  it('Cypress can visit the app', () => {
    cy.visit('/')
    cy.window().should('exist')
  })
})
