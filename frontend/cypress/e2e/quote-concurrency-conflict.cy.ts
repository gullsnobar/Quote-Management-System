describe('Optimistic Concurrency Conflict', () => {
  beforeEach(() => {
    cy.login()
  })

  function fetchQuote(quoteId: string): Cypress.Chainable<{ version: number; name: string }> {
    const apiUrl = Cypress.env('apiUrl') as string
    return cy.authHeaders().then((headers) =>
      cy.request({
        method: 'GET',
        url: `${apiUrl}/account/quotes/${quoteId}`,
        headers,
        log: false,
      })
    ).then((res) => ({
      version: res.body.data.version,
      name: res.body.data.name,
    }))
  }

  function updateQuoteExternally(quoteId: string, version: number, name: string, partnerName: string): Cypress.Chainable<void> {
    const apiUrl = Cypress.env('apiUrl') as string
    return cy.authHeaders().then((headers) =>
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/account/quotes/${quoteId}`,
        body: { name, partnerName, contractLength: 1, version },
        headers,
        log: false,
      })
    ).then(() => cy.wrap<void>(undefined))
  }

  it('rejects a stale save with a 409 conflict and does not overwrite the server state', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Conflict Test ${uniqueSuffix}`
    const partnerName = `Conflict Partner ${uniqueSuffix}`
    const externalUpdateName = `${quoteName} - EXTERNAL`
    const staleUpdateName = `${quoteName} - STALE SAVE ATTEMPT`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      fetchQuote(quoteId).then((initial) => {
        updateQuoteExternally(quoteId, initial.version, externalUpdateName, partnerName).then(() => {
          cy.intercept('PUT', `/api/v1/account/quotes/${quoteId}`, (req) => {
            req.body.version = initial.version
          }).as('staleSave')

          cy.visit(`/quotes/${quoteId}`)
          cy.get('[data-cy=quote-details]').should('be.visible')

          cy.get('[data-cy=quote-edit]').click()
          cy.get('[data-cy=edit-quote-name]').clear().type(staleUpdateName)
          cy.get('[data-cy=quote-save]').click()

          cy.wait('@staleSave').its('response.statusCode').should('eq', 409)

          cy.get('[data-cy=conflict-message]')
            .should('be.visible')
            .and('contain', 'Another user changed this quote')

          cy.get('.notification-error').should('be.visible')
          cy.get('.notification-success').should('not.exist')

          cy.get('[data-cy=conflict-reload]').click()
          cy.get('[data-cy=conflict-message]').should('not.exist')

          cy.get('[data-cy=quote-cancel-edit]').click()
          cy.get('.quote-header-title').should('have.text', externalUpdateName)

          fetchQuote(quoteId).then((afterConflict) => {
            expect(afterConflict.name, 'server has external update, not stale save').to.eq(externalUpdateName)
            expect(afterConflict.name, 'stale save was not persisted').to.not.eq(staleUpdateName)
          })
        })
      })
    })
  })
})
