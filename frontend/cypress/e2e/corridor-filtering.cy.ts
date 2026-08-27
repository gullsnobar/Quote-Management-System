describe('Browse Catalog Corridor Filtering', () => {
  const TOTAL_CORRIDORS = 3000
  const EUROPE_COUNT = 485
  const NETHERLANDS_COUNT = 43
  const COMBINED_COUNT = 43

  beforeEach(() => {
    cy.login()
  })

  function assertFilterCount(count: number): void {
    cy.get('[data-cy=corridor-filter-summary]')
      .should('contain', `${count.toLocaleString()}`)
  }

  function assertVisibleRowsContain(text: string): void {
    cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 0)
    cy.get('[data-cy=catalog-corridor-row]').each(($row) => {
      expect($row.text()).to.include(text)
    })
  }

  it('loads the catalog, filters by region, search, combined, and clears', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Catalog Filter Test ${uniqueSuffix}`
    const partnerName = `Catalog Partner ${uniqueSuffix}`

    cy.createTestQuote({ name: quoteName, partnerName }).then((quoteId) => {
      cy.openBrowseCatalog(quoteId)

      cy.get('[data-cy=catalog-corridor-row]').should('have.length.greaterThan', 0)
      assertFilterCount(TOTAL_CORRIDORS)

      cy.get('[data-cy=filter-region]').select('Europe')
      assertFilterCount(EUROPE_COUNT)
      assertVisibleRowsContain('Europe')

      cy.get('[data-cy=filter-region]').select('')
      assertFilterCount(TOTAL_CORRIDORS)

      cy.get('[data-cy=filter-payer-search]').type('Netherlands')
      assertFilterCount(NETHERLANDS_COUNT)
      assertVisibleRowsContain('Netherlands')

      cy.get('[data-cy=filter-payer-search]').clear()
      assertFilterCount(TOTAL_CORRIDORS)

      cy.get('[data-cy=filter-region]').select('Europe')
      cy.get('[data-cy=filter-payer-search]').type('Netherlands')
      assertFilterCount(COMBINED_COUNT)
      assertVisibleRowsContain('Europe')
      assertVisibleRowsContain('Netherlands')

      cy.contains('button', 'Clear').click()
      assertFilterCount(TOTAL_CORRIDORS)
      cy.get('[data-cy=filter-region]').should('have.value', '')
      cy.get('[data-cy=filter-payer-search]').should('have.value', '')
    })
  })
})
