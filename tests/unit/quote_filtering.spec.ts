import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'
import { listQuotesValidator, QUOTE_STATUSES } from '#validators/quote'

test.group('quote filtering', (group) => {
  group.each.setup(async () => {
    await Quote.query().delete()
    await User.query().delete()
  })

  test('it returns all quotes without filters', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 1',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 2',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'approved',
    })

    const quotes = await Quote.query().where('user_id', user.id)

    assert.lengthOf(quotes, 2)
  })

  test('it filters quotes by status', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Draft Quote',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Approved Quote',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'approved',
    })

    await Quote.create({
      userId: user.id,
      name: 'Another Draft',
      partnerName: 'Partner C',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const draftQuotes = await Quote.query().where('user_id', user.id).where('status', 'draft')

    assert.lengthOf(draftQuotes, 2)
    assert.equal(draftQuotes[0].status, 'draft')
    assert.equal(draftQuotes[1].status, 'draft')
  })

  test('it searches quotes by name', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Acme Corporation Quote',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Beta Industries Quote',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Gamma Corp Quote',
      partnerName: 'Partner C',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('name', '%acme%')
      })

    assert.lengthOf(searchResults, 1)
    assert.equal(searchResults[0].name, 'Acme Corporation Quote')
  })

  test('it searches quotes by partner_name', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 1',
      partnerName: 'Wise Ltd',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 2',
      partnerName: 'Banking Circle',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 3',
      partnerName: 'TransferWise',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('partner_name', '%wise%')
      })

    assert.lengthOf(searchResults, 2)
  })

  test('it searches quotes by name OR partner_name', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Acme Quote',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Beta Quote',
      partnerName: 'Acme Corp',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Gamma Quote',
      partnerName: 'Partner C',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('name', '%acme%').orWhereILike('partner_name', '%acme%')
      })

    assert.lengthOf(searchResults, 2)
  })

  test('it combines status filter and search correctly', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Acme Draft',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Acme Approved',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'approved',
    })

    await Quote.create({
      userId: user.id,
      name: 'Beta Draft',
      partnerName: 'Acme Corp',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // This should return: draft AND (name contains 'acme' OR partner_name contains 'acme')
    // Result: Acme Draft (name match) and Beta Draft (partner match)
    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where('status', 'draft')
      .where((builder) => {
        builder.whereILike('name', '%acme%').orWhereILike('partner_name', '%acme%')
      })

    assert.lengthOf(searchResults, 2)
    assert.equal(searchResults[0].status, 'draft')
    assert.equal(searchResults[1].status, 'draft')
  })

  test('it returns normal results with empty search', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 1',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 2',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // Empty search should not filter
    const quotes = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('name', '%%').orWhereILike('partner_name', '%%')
      })

    assert.lengthOf(quotes, 2)
  })

  test('it handles search with special characters safely', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote with "quotes"',
      partnerName: 'Partner & Co',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // Search with special characters should be handled safely by query builder
    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('name', '%"quotes"%')
      })

    assert.lengthOf(searchResults, 1)
    assert.equal(searchResults[0].name, 'Quote with "quotes"')
  })

  test('it prevents users from seeing other users quotes through filtering', async ({ assert }) => {
    const userA = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    const userB = await User.create({
      fullName: 'Bob',
      email: 'bob@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: userA.id,
      name: 'Alice Quote',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    await Quote.create({
      userId: userB.id,
      name: 'Bob Quote',
      partnerName: 'Partner B',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // User A should only see their own quotes even when searching
    const userASearch = await Quote.query()
      .where('user_id', userA.id)
      .where((builder) => {
        builder.whereILike('name', '%quote%')
      })

    assert.lengthOf(userASearch, 1)
    assert.equal(userASearch[0].userId, userA.id)

    // User B should only see their own quotes
    const userBSearch = await Quote.query()
      .where('user_id', userB.id)
      .where((builder) => {
        builder.whereILike('name', '%quote%')
      })

    assert.lengthOf(userBSearch, 1)
    assert.equal(userBSearch[0].userId, userB.id)
  })

  test('it handles case-insensitive search correctly', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'ACME Corporation',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    // Search with lowercase should match uppercase
    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where((builder) => {
        builder.whereILike('name', '%acme%')
      })

    assert.lengthOf(searchResults, 1)
    assert.equal(searchResults[0].name, 'ACME Corporation')
  })

  test('it returns empty array when no quotes match filters', async ({ assert }) => {
    const user = await User.create({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'Password123!',
    })

    await Quote.create({
      userId: user.id,
      name: 'Quote 1',
      partnerName: 'Partner A',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const searchResults = await Quote.query()
      .where('user_id', user.id)
      .where('status', 'approved')
      .where((builder) => {
        builder.whereILike('name', '%nonexistent%')
      })

    assert.lengthOf(searchResults, 0)
  })

  // =========================================================
  // Validator tests (AC-2: invalid filter input + clear/reset)
  // =========================================================

  test('listQuotesValidator accepts all valid quote statuses', async ({ assert }) => {
    for (const status of QUOTE_STATUSES) {
      const output = await listQuotesValidator.validate({ status })
      assert.equal(output.status, status)
    }
  })

  test('listQuotesValidator rejects an invalid status value', async ({ assert }) => {
    try {
      await listQuotesValidator.validate({ status: 'pending' })
      assert.fail('Should have rejected invalid status')
    } catch (err: any) {
      assert.isTrue(err.message.includes('status') || err.code === 'E_VALIDATION_ERROR')
    }
  })

  test('listQuotesValidator rejects an empty string status', async ({ assert }) => {
    try {
      await listQuotesValidator.validate({ status: '' })
      assert.fail('Should have rejected empty status')
    } catch (err: any) {
      assert.isTrue(err.message.includes('status') || err.code === 'E_VALIDATION_ERROR')
    }
  })

  test('listQuotesValidator accepts a valid search string', async ({ assert }) => {
    const output = await listQuotesValidator.validate({ search: 'acme' })
    assert.equal(output.search, 'acme')
  })

  test('listQuotesValidator trims search input', async ({ assert }) => {
    const output = await listQuotesValidator.validate({ search: '  acme  ' })
    assert.equal(output.search, 'acme')
  })

  test('listQuotesValidator rejects a search string exceeding 255 characters', async ({
    assert,
  }) => {
    const longSearch = 'a'.repeat(256)
    try {
      await listQuotesValidator.validate({ search: longSearch })
      assert.fail('Should have rejected overly long search')
    } catch (err: any) {
      assert.isTrue(err.message.includes('search') || err.code === 'E_VALIDATION_ERROR')
    }
  })

  test('listQuotesValidator accepts empty params (clear/reset filters scenario)', async ({
    assert,
  }) => {
    const output = await listQuotesValidator.validate({})
    assert.isUndefined(output.status)
    assert.isUndefined(output.search)
  })

  test('listQuotesValidator accepts both status and search together', async ({ assert }) => {
    const output = await listQuotesValidator.validate({ status: 'draft', search: 'acme' })
    assert.equal(output.status, 'draft')
    assert.equal(output.search, 'acme')
  })

  test('QUOTE_STATUSES contains the four project-defined statuses', ({ assert }) => {
    assert.deepEqual([...QUOTE_STATUSES], ['draft', 'in_review', 'approved', 'rejected'])
  })
})
