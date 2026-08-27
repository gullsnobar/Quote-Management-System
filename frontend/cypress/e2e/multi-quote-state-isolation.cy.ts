describe('Multi-Quote State Isolation', () => {
  beforeEach(() => {
    cy.login()
  })

  it('isolates state between quotes and discards unsaved edits on navigation', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteAName = `Isolation A ${uniqueSuffix}`
    const quoteBName = `Isolation B ${uniqueSuffix}`
    const partnerName = `Isolation Partner ${uniqueSuffix}`
    const unsavedEditA = `${quoteAName} - UNSAVED EDIT`

    cy.createTestQuote({ name: quoteAName, partnerName }).then((quoteAId) => {
      cy.createTestQuote({ name: quoteBName, partnerName }).then((quoteBId) => {
        cy.visit(`/quotes/${quoteAId}`)
        cy.get('[data-cy=quote-details]').should('be.visible')
        cy.get('.quote-header-title').should('have.text', quoteAName)

        cy.get('[data-cy=quote-edit]').click()
        cy.get('[data-cy=edit-quote-name]').clear().type(unsavedEditA)
        cy.get('[data-cy=edit-quote-name]').should('have.value', unsavedEditA)

        cy.visit(`/quotes/${quoteBId}`)
        cy.get('[data-cy=quote-details]').should('be.visible')
        cy.get('.quote-header-title').should('have.text', quoteBName)
        cy.get('.quote-header-title').should('not.have.text', unsavedEditA)

        cy.get('[data-cy=quote-edit]').click()
        cy.get('[data-cy=edit-quote-name]').should('have.value', quoteBName)
        cy.get('[data-cy=edit-quote-name]').should('not.have.value', unsavedEditA)
        cy.get('[data-cy=quote-cancel-edit]').click()

        cy.visit(`/quotes/${quoteAId}`)
        cy.get('[data-cy=quote-details]').should('be.visible')
        cy.get('.quote-header-title').should('have.text', quoteAName)
        cy.get('.quote-header-title').should('not.have.text', unsavedEditA)

        cy.get('[data-cy=quote-edit]').click()
        cy.get('[data-cy=edit-quote-name]').should('have.value', quoteAName)
        cy.get('[data-cy=edit-quote-name]').should('not.have.value', unsavedEditA)
        cy.get('[data-cy=quote-cancel-edit]').click()
      })
    })
  })
})
