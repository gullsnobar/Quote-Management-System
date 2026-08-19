import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import Corridor from '#models/corridor'
import QuoteAuditLog from '#models/quote_audit_log'
import AuditLogService from '#services/audit_log_service'
import { attachCorridorsValidator, listCorridorsValidator } from '#validators/quote'

test.group('quote corridor management', (group) => {
  group.each.setup(async () => {
    await QuoteAuditLog.query().delete()
    await Quote.query().delete()
    await Corridor.query().delete()
    await User.query().delete()
  })

  test('it attaches corridors to an editable quote', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Owner',
      email: 'owner@example.com',
      password: 'Password123!',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Q1',
      partnerName: 'Acme',
      contractLength: 1,
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
      fxSource: 'Reuters',
      defaultFxSpread: 0.015,
      treasuryFxCost: 0.01,
      costFixedPerUsd: 0.001,
      costVariablePerTrx: 0.2,
      needsApproval: false,
    })

    await quote.related('corridors').attach([corridor.id])

    const reloaded = await Quote.query().where('id', quote.id).preload('corridors').firstOrFail()
    assert.lengthOf(reloaded.corridors, 1)
    assert.equal(reloaded.corridors[0].id, corridor.id)
  })

  test('it detaches corridors from an editable quote', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Owner',
      email: 'owner@example.com',
      password: 'Password123!',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Q1',
      partnerName: 'Acme',
      contractLength: 1,
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
      fxSource: 'Reuters',
      defaultFxSpread: 0.015,
      treasuryFxCost: 0.01,
      costFixedPerUsd: 0.001,
      costVariablePerTrx: 0.2,
      needsApproval: false,
    })

    await quote.related('corridors').attach([corridor.id])
    await quote.related('corridors').detach([corridor.id])

    const reloaded = await Quote.query().where('id', quote.id).preload('corridors').firstOrFail()
    assert.lengthOf(reloaded.corridors, 0)
  })

  test('attachCorridorsValidator rejects an empty corridorIds array', async ({ assert }) => {
    try {
      await attachCorridorsValidator.validate({ corridorIds: [] })
      assert.fail('Should have rejected empty array')
    } catch (error: any) {
      assert.isTrue(error.messages !== undefined || error.code !== undefined)
    }
  })

  test('attachCorridorsValidator rejects non-positive corridor IDs', async ({ assert }) => {
    try {
      await attachCorridorsValidator.validate({ corridorIds: [0, -1] })
      assert.fail('Should have rejected non-positive IDs')
    } catch (error: any) {
      assert.isTrue(error.messages !== undefined || error.code !== undefined)
    }
  })

  test('attachCorridorsValidator accepts a valid array of positive integers', async ({ assert }) => {
    const payload = await attachCorridorsValidator.validate({ corridorIds: [1, 2, 3] })
    assert.deepEqual(payload.corridorIds, [1, 2, 3])
  })

  test('listCorridorsValidator accepts empty params (no filters)', async ({ assert }) => {
    const payload = await listCorridorsValidator.validate({})
    assert.deepEqual(payload, {})
  })

  test('listCorridorsValidator accepts all valid filter fields', async ({ assert }) => {
    const payload = await listCorridorsValidator.validate({
      region: 'Europe',
      country: 'Denmark',
      transactionType: 'B2B',
      service: 'BankAccount',
      payoutCurrency: 'EUR',
      receivingPartner: 'Nordic',
      payer: 'Acme',
    })
    assert.equal(payload.region, 'Europe')
    assert.equal(payload.country, 'Denmark')
  })

  test('listCorridorsValidator rejects a region exceeding max length', async ({ assert }) => {
    try {
      await listCorridorsValidator.validate({ region: 'x'.repeat(101) })
      assert.fail('Should have rejected overly long region')
    } catch (error: any) {
      assert.isTrue(error.messages !== undefined || error.code !== undefined)
    }
  })
})

test.group('audit logging', (group) => {
  group.each.setup(async () => {
    await QuoteAuditLog.query().delete()
    await Quote.query().delete()
    await User.query().delete()
  })

  test('AuditLogService.record creates an audit log entry', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Auditor',
      email: 'auditor@example.com',
      password: 'Password123!',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Audited Quote',
      partnerName: 'Acme',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_CREATED,
      metadata: { name: 'Audited Quote' },
    })

    const logs = await QuoteAuditLog.query().where('quote_id', quote.id)
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].action, 'quote.created')
    assert.equal(logs[0].userId, user.id)
    assert.deepEqual(logs[0].metadata, { name: 'Audited Quote' })
  })

  test('AuditLogService.record does not throw when given valid input', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Auditor',
      email: 'auditor2@example.com',
      password: 'Password123!',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Q2',
      partnerName: 'Acme',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // Should not throw
    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_UPDATED,
    })

    const logs = await QuoteAuditLog.query().where('quote_id', quote.id)
    assert.lengthOf(logs, 1)
    assert.isNull(logs[0].metadata)
  })

  test('multiple audit entries for the same quote are ordered by creation time', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Auditor',
      email: 'auditor3@example.com',
      password: 'Password123!',
    })

    const quote = await Quote.create({
      userId: user.id,
      name: 'Q3',
      partnerName: 'Acme',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_CREATED,
    })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_UPDATED,
    })

    await AuditLogService.record({
      quoteId: quote.id,
      userId: user.id,
      action: AuditLogService.ACTIONS.QUOTE_SUBMITTED,
    })

    const logs = await QuoteAuditLog.query()
      .where('quote_id', quote.id)
      .orderBy('created_at', 'asc')

    assert.lengthOf(logs, 3)
    assert.equal(logs[0].action, 'quote.created')
    assert.equal(logs[1].action, 'quote.updated')
    assert.equal(logs[2].action, 'quote.submitted')
  })
})
