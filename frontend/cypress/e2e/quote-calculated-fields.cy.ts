describe('Quote Calculated Fields', () => {
  beforeEach(() => {
    cy.login()
  })

  function fetchQuoteFromBackend(quoteId: string): Cypress.Chainable<{
    totalRevenue: number
    monthlyRevenue: number
    tcv: number
    contractLength: number
  }> {
    const apiUrl = Cypress.env('apiUrl') as string
    return cy.authHeaders().then((headers) =>
      cy.request({
        method: 'GET',
        url: `${apiUrl}/account/quotes/${quoteId}`,
        headers,
        log: false,
      })
    ).then((res) => ({
      totalRevenue: res.body.data.totalRevenue,
      monthlyRevenue: res.body.data.monthlyRevenue,
      tcv: res.body.data.tcv,
      contractLength: res.body.data.contractLength,
    }))
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function setupQuoteWithCorridor(quoteName: string, partnerName: string): Cypress.Chainable<string> {
    const apiUrl = Cypress.env('apiUrl') as string

    return cy.createTestQuote({ name: quoteName, partnerName, contractLength: 1 }).then((quoteId) =>
      cy.authHeaders().then((headers) =>
        cy.request({
          method: 'GET',
          url: `${apiUrl}/account/corridors`,
          headers,
          log: false,
        })
      ).then((corridorsRes) => {
        const corridorId = corridorsRes.body.data[0].id
        return cy.authHeaders().then((headers) =>
          cy.request({
            method: 'POST',
            url: `${apiUrl}/account/quotes/${quoteId}/corridors/attach`,
            body: { corridorIds: [corridorId] },
            headers,
            log: false,
          })
        ).then(() => quoteId)
      })
    )
  }

  const TOLERANCE = 0.01

  it('displays backend-computed values, no live preview during edit, and updates after save', () => {
    const uniqueSuffix = `${Date.now()}`
    const quoteName = `Calc Field Test ${uniqueSuffix}`
    const partnerName = `Calc Partner ${uniqueSuffix}`

    setupQuoteWithCorridor(quoteName, partnerName).then((quoteId) => {
      cy.visit(`/quotes/${quoteId}`)
      cy.get('[data-cy=quote-details]').should('be.visible')
      cy.get('[data-cy=tab-overview]').click()

      fetchQuoteFromBackend(quoteId).then((backend) => {
        expect(backend.totalRevenue, 'totalRevenue > 0 (corridor attached)').to.be.greaterThan(0)
        expect(backend.monthlyRevenue, 'monthlyRevenue = totalRevenue / 12')
          .to.be.closeTo(backend.totalRevenue / 12, TOLERANCE)
        expect(backend.tcv, 'tcv = totalRevenue * contractLength (1)')
          .to.be.closeTo(backend.totalRevenue * backend.contractLength, TOLERANCE)

        cy.get('[data-cy=total-revenue] .fin-card-value')
          .should('contain', formatCurrency(backend.totalRevenue))
        cy.get('[data-cy=monthly-revenue] .info-card-value')
          .should('contain', formatCurrency(backend.monthlyRevenue))
        cy.get('[data-cy=tcv]')
          .should('contain', formatCurrency(backend.tcv))

        cy.get('[data-cy=quote-edit]').click()
        cy.get('[data-cy=edit-quote-contract-length]').should('be.visible')
        cy.get('[data-cy=edit-quote-contract-length]').select('3')

        cy.get('[data-cy=total-revenue] .fin-card-value')
          .should('contain', formatCurrency(backend.totalRevenue))
        cy.get('[data-cy=monthly-revenue] .info-card-value')
          .should('contain', formatCurrency(backend.monthlyRevenue))
        cy.get('[data-cy=tcv]')
          .should('contain', formatCurrency(backend.tcv))

        cy.get('[data-cy=quote-save]').click()
        cy.get('.quote-header-title').should('be.visible')

        fetchQuoteFromBackend(quoteId).then((backendAfterSave) => {
          expect(backendAfterSave.contractLength, 'contractLength updated to 3').to.eq(3)
          expect(backendAfterSave.tcv, 'tcv = totalRevenue * 3')
            .to.be.closeTo(backendAfterSave.totalRevenue * 3, TOLERANCE)
          expect(backendAfterSave.monthlyRevenue, 'monthlyRevenue = totalRevenue / 12 (unchanged by contractLength)')
            .to.be.closeTo(backendAfterSave.totalRevenue / 12, TOLERANCE)
          expect(backendAfterSave.totalRevenue, 'totalRevenue unchanged by contractLength')
            .to.eq(backend.totalRevenue)

          cy.get('[data-cy=tcv]')
            .should('contain', formatCurrency(backendAfterSave.tcv))
          cy.get('[data-cy=total-revenue] .fin-card-value')
            .should('contain', formatCurrency(backendAfterSave.totalRevenue))
          cy.get('[data-cy=monthly-revenue] .info-card-value')
            .should('contain', formatCurrency(backendAfterSave.monthlyRevenue))

          expect(backendAfterSave.tcv, 'tcv changed after save').to.not.eq(backend.tcv)
        })

        cy.reload()
        cy.get('[data-cy=quote-details]').should('be.visible')
        cy.get('[data-cy=tab-overview]').click()

        fetchQuoteFromBackend(quoteId).then((backendAfterReload) => {
          cy.get('[data-cy=tcv]')
            .should('contain', formatCurrency(backendAfterReload.tcv))
        })
      })
    })
  })
})
