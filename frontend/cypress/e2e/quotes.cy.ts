describe('Quote Creation', () => {
  beforeEach(() => {
    cy.login()
  })

  it('creates a quote with valid information and verifies persisted values', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Cypress Test Quote ${uniqueSuffix}`
    const partnerName = `Cypress Partner ${uniqueSuffix}`
    const contractLength = '3'

    cy.visit('/')
    cy.contains('h1', 'Quotes Dashboard').should('be.visible')

    cy.get('[data-cy=create-quote-button]').click()

    cy.get('[data-cy=create-quote-name]').should('be.visible').type(quoteName)
    cy.get('[data-cy=create-quote-partner]').type(partnerName)
    cy.get('[data-cy=create-quote-contract-length]').select(contractLength)

    cy.get('[data-cy=create-quote-submit]').click()

    cy.get('[data-cy=create-quote-submit]').should('not.exist')

    cy.get('[data-cy=quote-card]')
      .contains('h3', quoteName)
      .should('be.visible')

    cy.get('[data-cy=quote-card]')
      .contains(partnerName)
      .should('be.visible')

    cy.get('[data-cy=quote-card]')
      .filter(`:has(h3:contains(${Cypress.$.escapeSelector(quoteName)}))`)
      .find('[data-cy=quote-status]')
      .should('have.attr', 'data-cy-status', 'draft')

    cy.get('[data-cy=quote-card]')
      .filter(`:has(h3:contains(${Cypress.$.escapeSelector(quoteName)}))`)
      .click()

    cy.url().should('match', /\/quotes\/\d+$/)
    cy.get('[data-cy=quote-details]').should('be.visible')

    cy.get('.quote-header-title').should('have.text', quoteName)
    cy.get('.quote-header-meta').should('contain', partnerName)
    cy.get('[data-cy=quote-status]').should('have.attr', 'data-cy-status', 'draft')

    cy.get('[data-cy=tab-overview]').click()
    cy.contains('.info-card-label', 'Commercial Partner')
      .siblings('.info-card-value')
      .should('have.text', partnerName)
    cy.contains('.info-card-label', 'Contract Length')
      .siblings('.info-card-value')
      .should('have.text', `${contractLength} Years`)
    cy.contains('.info-card-label', 'Status')
      .parent()
      .find('[data-cy=quote-status]')
      .should('have.attr', 'data-cy-status', 'draft')
  })
})
