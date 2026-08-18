import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteCalculationService from '#services/quote_calculation_service'

test.group('quote corridors', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Quote.query().delete()
    await Corridor.query().delete()
  })

  test('it calculates totals from attached corridors and keeps the relationship working', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Spring Quote',
      partnerName: 'Atlas',
      contractLength: 2,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const corridor = await Corridor.create({
      versionId: 1,
      sourceRowId: 'row-1',
      corridorId: 1001,
      region: 'Europe',
      country: 'Denmark',
      transactionType: 'B2B',
      service: 'BankAccount',
      receivingPartner: 'Nordic Bank',
      payer: 'Acme Ltd',
      payoutCurrency: 'EUR',
      historicalAtv: 120,
      atvUsd: 100,
      stdFixedFeeUsd: 1,
      variableFeePercentage: 0.01,
      fxSource: 'Reuters Bid rates',
      defaultFxSpread: 0.015,
      treasuryFxCost: 0.01,
      costFixedPerUsd: 0.001,
      costVariablePerTrx: 0.2,
      needsApproval: false,
    })

    await quote.related('corridors').attach([corridor.id])

    const result = await Quote.query().where('id', quote.id).preload('corridors').firstOrFail()
    const calculations = QuoteCalculationService.calculateForQuote(result)

    assert.lengthOf(result.corridors, 1)
    assert.equal(calculations.totalRevenue, 2000)
    assert.equal(calculations.monthlyRevenue, 166.666667)
    assert.equal(calculations.tcv, 4000)
  })
})
