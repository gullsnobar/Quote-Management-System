describe('Quote View/Edit Workflow', () => {
  beforeEach(() => {
    cy.login()
  })

  it('opens in view mode, discards cancelled edits, and persists saved edits', () => {
    const uniqueSuffix = `${Date.now()}`
    const originalName = `Edit Test Quote ${uniqueSuffix}`
    const partnerName = `Edit Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: originalName, partnerName, contractLength: 2 }).then((quoteId) => {
      cy.visit(`/quotes/${quoteId}`)
      cy.get('[data-cy=quote-details]').should('be.visible')

      cy.get('.quote-header-title').should('have.text', originalName)
      cy.get('[data-cy=edit-quote-name]').should('not.exist')
      cy.get('[data-cy=edit-quote-partner]').should('not.exist')
      cy.get('[data-cy=quote-edit]').should('be.visible')
      cy.get('[data-cy=quote-save]').should('not.exist')

      cy.get('[data-cy=quote-edit]').click()

      cy.get('[data-cy=edit-quote-name]').should('be.visible').and('have.value', originalName)
      cy.get('[data-cy=edit-quote-partner]').should('be.visible')
      cy.get('[data-cy=quote-save]').should('be.visible')
      cy.get('[data-cy=quote-cancel-edit]').should('be.visible')
      cy.get('[data-cy=quote-edit]').should('not.exist')

      const cancelledName = `${originalName} - CANCELLED`
      cy.get('[data-cy=edit-quote-name]').clear().type(cancelledName)
      cy.get('[data-cy=quote-cancel-edit]').click()

      cy.get('.quote-header-title').should('have.text', originalName)
      cy.get('[data-cy=edit-quote-name]').should('not.exist')
      cy.get('[data-cy=quote-edit]').should('be.visible')

      const savedName = `${originalName} - SAVED`
      cy.get('[data-cy=quote-edit]').click()
      cy.get('[data-cy=edit-quote-name]').should('have.value', originalName)
      cy.get('[data-cy=edit-quote-name]').clear().type(savedName)
      cy.get('[data-cy=quote-save]').click()

      cy.get('.quote-header-title').should('have.text', savedName)
      cy.get('[data-cy=edit-quote-name]').should('not.exist')
      cy.get('[data-cy=quote-edit]').should('be.visible')

      cy.reload()
      cy.get('[data-cy=quote-details]').should('be.visible')
      cy.get('.quote-header-title').should('have.text', savedName)
    })
  })
})
