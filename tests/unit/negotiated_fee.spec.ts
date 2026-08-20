import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteAuditLog from '#models/quote_audit_log'
import CorridorCalculationService from '#services/corridor_calculation_service'
import QuoteCalculationService from '#services/quote_calculation_service'
import { updateNegotiatedFeeValidator } from '#validators/quote'

/**
 * Helper: create a standard test corridor with a known fee.
 */
async function createCorridor(overrides: Partial<Corridor> = {}): Promise<Corridor> {
  return Corridor.create({
    versionId: 1,
    sourceRowId: 'row-1',
    corridorId: Math.floor(Math.random() * 100000),
    region: 'Europe',
    country: 'Denmark',
    transactionType: 'B2B',
    service: 'BankAccount',
    receivingPartner: 'Nordic Bank',
    payer: 'Acme Ltd',
    payoutCurrency: 'EUR',
    historicalAtv: 120,
    atvUsd: 100,
    stdFixedFeeUsd: 3,
    variableFeePercentage: 0.01,
    fxSource: 'Reuters',
    defaultFxSpread: 0.015,
    treasuryFxCost: 0.01,
    costFixedPerUsd: 0.001,
    costVariablePerTrx: 0.2,
    needsApproval: false,
    ...overrides,
  })
}

/**
 * Helper: create a standard test quote.
 */
async function createQuote(user: User, overrides: Partial<Quote> = {}): Promise<Quote> {
  return Quote.create({
    userId: user.id,
    name: 'Test Quote',
    partnerName: 'Acme',
    contractLength: 1,
    totalRevenue: 0,
    monthlyRevenue: 0,
    tcv: 0,
    version: 1,
    status: 'draft',
    ...overrides,
  })
}

test.group('negotiated fee — calculation service', (group) => {
  group.each.setup(async () => {
    await QuoteAuditLog.query().delete()
    await Quote.query().delete()
    await Corridor.query().delete()
    await User.query().delete()
  })

  test('CorridorCalculationService uses negotiated fee when provided', async ({ assert }) => {
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    // yearlyVolumeUsd = 100000, atvUsd = 100 → yearlyTrx = 1000
    // Standard: revenue = 3 * 1000 + 0.01 * 100000 = 3000 + 1000 = 4000
    const standardCalc = CorridorCalculationService.calculate(corridor)
    assert.equal(standardCalc.revenue, 4000)

    // Negotiated: revenue = 2 * 1000 + 0.01 * 100000 = 2000 + 1000 = 3000
    const negotiatedCalc = CorridorCalculationService.calculate(corridor, 2)
    assert.equal(negotiatedCalc.revenue, 3000)
  })

  test('CorridorCalculationService uses standard fee when negotiated is null', async ({ assert }) => {
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    const calc = CorridorCalculationService.calculate(corridor, null)
    assert.equal(calc.revenue, 4000)
  })

  test('CorridorCalculationService uses standard fee when negotiated is undefined', async ({ assert }) => {
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    const calc = CorridorCalculationService.calculate(corridor, undefined)
    assert.equal(calc.revenue, 4000)
  })

  test('negotiated fee of zero is used (not treated as null)', async ({ assert }) => {
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    // 0 * 1000 + 0.01 * 100000 = 0 + 1000 = 1000
    const calc = CorridorCalculationService.calculate(corridor, 0)
    assert.equal(calc.revenue, 1000)
  })

  test('cost is not affected by negotiated fee', async ({ assert }) => {
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    const standardCalc = CorridorCalculationService.calculate(corridor)
    const negotiatedCalc = CorridorCalculationService.calculate(corridor, 2)
    assert.equal(standardCalc.cost, negotiatedCalc.cost)
  })
})

test.group('negotiated fee — quote calculation service', (group) => {
  group.each.setup(async () => {
    await QuoteAuditLog.query().delete()
    await Quote.query().delete()
    await Corridor.query().delete()
    await User.query().delete()
  })

  test('QuoteCalculationService uses negotiated fee from pivot extras', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    const quote = await createQuote(user, { contractLength: 1 })
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    await quote.related('corridors').attach([corridor.id])

    // Simulate the negotiated fee being set on the pivot
    await quote.related('corridors').sync({
      [corridor.id]: { negotiated_fee: 2 },
    })

    // Reload with pivot
    const reloaded = await Quote.query().where('id', quote.id).preload('corridors').firstOrFail()
    const calc = QuoteCalculationService.calculateForQuote(reloaded)

    // revenue = 2 * 1000 + 0.01 * 100000 = 3000
    assert.equal(calc.totalRevenue, 3000)
    assert.equal(calc.tcv, 3000)
  })

  test('QuoteCalculationService uses standard fee when no override', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test2@example.com',
      password: 'password123',
    })

    const quote = await createQuote(user, { contractLength: 1 })
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    await quote.related('corridors').attach([corridor.id])

    const reloaded = await Quote.query().where('id', quote.id).preload('corridors').firstOrFail()
    const calc = QuoteCalculationService.calculateForQuote(reloaded)

    // revenue = 3 * 1000 + 0.01 * 100000 = 4000
    assert.equal(calc.totalRevenue, 4000)
  })

  test('multiple quotes with different negotiated fees are independent', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test3@example.com',
      password: 'password123',
    })

    const quoteA = await createQuote(user, { name: 'Quote A' })
    const quoteB = await createQuote(user, { name: 'Quote B' })
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })

    await quoteA.related('corridors').attach([corridor.id])
    await quoteB.related('corridors').attach([corridor.id])

    await quoteA.related('corridors').sync({ [corridor.id]: { negotiated_fee: 2 } })
    await quoteB.related('corridors').sync({ [corridor.id]: { negotiated_fee: 2.5 } })

    const reloadedA = await Quote.query().where('id', quoteA.id).preload('corridors').firstOrFail()
    const reloadedB = await Quote.query().where('id', quoteB.id).preload('corridors').firstOrFail()

    const calcA = QuoteCalculationService.calculateForQuote(reloadedA)
    const calcB = QuoteCalculationService.calculateForQuote(reloadedB)

    // Quote A: 2 * 1000 + 1000 = 3000
    assert.equal(calcA.totalRevenue, 3000)
    // Quote B: 2.5 * 1000 + 1000 = 3500
    assert.equal(calcB.totalRevenue, 3500)

    // Global corridor unchanged
    const globalCorridor = await Corridor.find(corridor.id)
    assert.equal(Number(globalCorridor!.stdFixedFeeUsd), 3)
  })
})

test.group('negotiated fee — validation', () => {
  test('updateNegotiatedFeeValidator accepts a valid non-negative number', async ({ assert }) => {
    const payload = await updateNegotiatedFeeValidator.validate({ negotiatedFee: 2.5 })
    assert.equal(payload.negotiatedFee, 2.5)
  })

  test('updateNegotiatedFeeValidator accepts zero', async ({ assert }) => {
    const payload = await updateNegotiatedFeeValidator.validate({ negotiatedFee: 0 })
    assert.equal(payload.negotiatedFee, 0)
  })

  test('updateNegotiatedFeeValidator accepts null (clear override)', async ({ assert }) => {
    const payload = await updateNegotiatedFeeValidator.validate({ negotiatedFee: null })
    assert.isNull(payload.negotiatedFee)
  })

  test('updateNegotiatedFeeValidator rejects negative values', async ({ assert }) => {
    try {
      await updateNegotiatedFeeValidator.validate({ negotiatedFee: -1 })
      assert.fail('Should have rejected negative value')
    } catch (error: any) {
      assert.isTrue(error.messages !== undefined || error.code !== undefined)
    }
  })

  test('updateNegotiatedFeeValidator rejects non-numeric strings', async ({ assert }) => {
    try {
      await updateNegotiatedFeeValidator.validate({ negotiatedFee: 'abc' })
      assert.fail('Should have rejected string')
    } catch (error: any) {
      assert.isTrue(error.messages !== undefined || error.code !== undefined)
    }
  })
})

test.group('negotiated fee — global corridor isolation', (group) => {
  group.each.setup(async () => {
    await QuoteAuditLog.query().delete()
    await Quote.query().delete()
    await Corridor.query().delete()
    await User.query().delete()
  })

  test('setting a negotiated fee does not modify the global corridor', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'test4@example.com',
      password: 'password123',
    })

    const quote = await createQuote(user)
    const corridor = await createCorridor({ stdFixedFeeUsd: 3, atvUsd: 100 })
    await quote.related('corridors').attach([corridor.id])

    await quote.related('corridors').sync({ [corridor.id]: { negotiated_fee: 2 } })

    // Global corridor must still have stdFixedFeeUsd = 3
    const reloaded = await Corridor.find(corridor.id)
    assert.equal(Number(reloaded!.stdFixedFeeUsd), 3)
  })
})
