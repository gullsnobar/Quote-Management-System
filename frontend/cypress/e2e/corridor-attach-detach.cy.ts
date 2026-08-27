describe('Corridor Attachment and Detachment', () => {
  const TARGET_CORRIDOR_ID = 1

  beforeEach(() => {
    cy.login()
  })

  it('attaches a corridor from the catalog and detaches it from My Corridors', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Attach Test ${uniqueSuffix}`
    const partnerName = `Attach Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.openBrowseCatalog(quoteId)

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .should('be.visible')
        .find('[data-cy=corridor-attach]')
        .should('be.visible')
        .and('not.be.disabled')

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .find('[data-cy=corridor-attach]')
        .click()

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .find('[data-cy=corridor-attached-label]')
        .should('be.visible')
        .and('contain', 'Attached')

      cy.get('[data-cy=subtab-my-corridors]').click()

      cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .should('exist')
        .scrollIntoView()

      cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .find('[data-cy=corridor-detach]')
        .should('not.be.disabled')
        .click({ force: true })

      cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .should('not.exist')

      cy.get('[data-cy=subtab-browse-catalog]').click()

      cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${TARGET_CORRIDOR_ID}"]`)
        .should('be.visible')
        .find('[data-cy=corridor-attach]')
        .should('be.visible')
    })
  })
})
