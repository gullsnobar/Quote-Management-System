describe('Quote Audit History', () => {
  beforeEach(() => {
    cy.login()
  })

  it('records a quote update in the audit history', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Audit Test ${uniqueSuffix}`
    const partnerName = `Audit Partner ${uniqueSuffix}`
    const updatedName = `${quoteName} - UPDATED`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.visit(`/quotes/${quoteId}`)
      cy.get('[data-cy=quote-details]').should('be.visible')

      cy.get('[data-cy=quote-edit]').click()
      cy.get('[data-cy=edit-quote-name]').clear().type(updatedName)
      cy.get('[data-cy=quote-save]').click()
      cy.get('.quote-header-title').should('have.text', updatedName)

      cy.get('[data-cy=tab-audit]').click()
      cy.get('[data-cy=audit-trail]').should('be.visible')
      cy.get('[data-cy=audit-entry]').should('have.length.greaterThan', 0)

      cy.get('[data-cy=audit-entry]')
        .filter(`[data-cy-action="quote.updated"]`)
        .first()
        .as('updateEntry')

      cy.get('@updateEntry').should('be.visible')
      cy.get('@updateEntry').should('contain', 'Quote Updated')

      cy.get('@updateEntry').find('.audit-entry-detail').should('contain', updatedName)

      cy.get('[data-cy=audit-entry]')
        .filter(`[data-cy-action="quote.created"]`)
        .should('have.length.greaterThan', 0)

      cy.get('[data-cy=audit-entry]').first().should('have.attr', 'data-cy-action', 'quote.updated')
    })
  })

  it('records a corridor attachment in the audit history', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Audit Attach Test ${uniqueSuffix}`
    const partnerName = `Audit Attach Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.openBrowseCatalog(quoteId)

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="1"]`)
        .find('[data-cy=corridor-attach]')
        .click()

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="1"]`)
        .find('[data-cy=corridor-attached-label]')
        .should('be.visible')

      cy.get('[data-cy=tab-audit]').click()
      cy.get('[data-cy=audit-trail]').should('be.visible')
      cy.get('[data-cy=audit-entry]').should('have.length.greaterThan', 0)

      cy.get('[data-cy=audit-entry]')
        .filter(`[data-cy-action="quote.corridors.attached"]`)
        .first()
        .as('attachEntry')

      cy.get('@attachEntry').should('be.visible')
      cy.get('@attachEntry').should('contain', 'Corridors Attached')

      cy.get('@attachEntry').find('.audit-entry-detail').should('contain', '1')

      cy.get('[data-cy=audit-entry]').first().should('have.attr', 'data-cy-action', 'quote.corridors.attached')
    })
  })
})
