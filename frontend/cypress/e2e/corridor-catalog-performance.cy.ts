describe('Corridor Catalog Performance', () => {
  const TOTAL_CORRIDORS = 3000
  const EUROPE_COUNT = 485
  const CATALOG_READY_TIMEOUT = 15000

  beforeEach(() => {
    cy.login()
  })

  it('renders 3,000 corridors with virtualization and remains responsive', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Perf Test ${uniqueSuffix}`
    const partnerName = `Perf Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.openBrowseCatalog(quoteId, { waitForRows: false })

      cy.get('[data-cy=corridor-filter-summary]', { timeout: CATALOG_READY_TIMEOUT })
        .should('be.visible')
        .and('contain', TOTAL_CORRIDORS.toLocaleString())

      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 5)
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.lessThan', 60)

      cy.get('.corridor-table-scroll').should('be.visible')

      cy.get('.corridor-table-scroll').scrollTo(0, 5000, { duration: 500 })

      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 5)
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.lessThan', 60)

      cy.get('.corridor-table-scroll').scrollTo(0, 20000, { duration: 500 })

      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 5)
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.lessThan', 60)

      cy.get('.corridor-table-scroll').scrollTo(0, 0, { duration: 500 })

      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 5)

      cy.get('[data-cy=filter-region]').select('Europe')
      cy.get('[data-cy=corridor-filter-summary]')
        .should('contain', EUROPE_COUNT.toLocaleString())
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 0)
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.lessThan', 60)

      cy.get('[data-cy=catalog-corridor-row]').each(($row) => {
        expect($row.text()).to.include('Europe')
      })

      cy.contains('button', 'Clear').click()
      cy.get('[data-cy=corridor-filter-summary]')
        .should('contain', TOTAL_CORRIDORS.toLocaleString())
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 5)
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.lessThan', 60)

      cy.get('[data-cy=filter-payer-search]').type('Netherlands')
      cy.get('[data-cy=corridor-filter-summary]')
        .should('contain', '43')
      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 0)
      cy.get('[data-cy=catalog-corridor-row]').each(($row) => {
        expect($row.text()).to.include('Netherlands')
      })
    })
  })
})
