describe('Bulk Corridor Operations', () => {
  const CORRIDOR_IDS = [1, 2, 3]

  beforeEach(() => {
    cy.login()
  })

  it('bulk attaches multiple corridors and bulk detaches them', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Bulk Test ${uniqueSuffix}`
    const partnerName = `Bulk Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.openBrowseCatalog(quoteId)

      CORRIDOR_IDS.forEach((id) => {
        cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${id}"]`)
          .find('[data-cy=catalog-corridor-checkbox]')
          .click()
      })

      cy.get('[data-cy=bulk-attach]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain', `${CORRIDOR_IDS.length}`)

      cy.get('[data-cy=bulk-attach]').click()

      cy.get('[data-cy=bulk-attach]').should('be.disabled')

      cy.get('[data-cy=subtab-my-corridors]').click()

      CORRIDOR_IDS.forEach((id) => {
        cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${id}"]`)
          .should('exist')
      })

      cy.contains('span', `${CORRIDOR_IDS.length} Corridor`).should('be.visible')

      CORRIDOR_IDS.forEach((id) => {
        cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${id}"]`)
          .find('[data-cy=corridor-checkbox]')
          .click()
      })

      cy.get('[data-cy=bulk-detach]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain', `${CORRIDOR_IDS.length}`)

      cy.get('[data-cy=bulk-detach]').click()

      cy.get('[data-cy=confirm-dialog]').should('be.visible')
      cy.get('[data-cy=confirm-ok]').click()

      CORRIDOR_IDS.forEach((id) => {
        cy.get(`[data-cy=corridor-row][data-cy-corridor-id="${id}"]`)
          .should('not.exist')
      })

      cy.get('[data-cy=subtab-browse-catalog]').click()

      CORRIDOR_IDS.forEach((id) => {
        cy.get(`[data-cy=catalog-corridor-row][data-cy-corridor-id="${id}"]`)
          .find('[data-cy=corridor-attach]')
          .should('be.visible')
      })
    })
  })
})
