import { test } from '@japa/runner'
import User from '#models/user'
import Quote from '#models/quote'

test.group('quote concurrency', (group) => {
  group.each.setup(async () => {
    await Quote.query().delete()
    await User.query().delete()
  })

  test('it rejects stale updates with a conditional version check and preserves the latest write', async ({ assert }) => {
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

    const quote = await Quote.create({
      userId: userA.id,
      name: 'Initial quote',
      partnerName: 'Acme Corp',
      contractLength: 1,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tcv: 0,
      version: 1,
      status: 'draft',
    })

    const firstWrite = await Quote.query()
      .where('id', quote.id)
      .where('user_id', userA.id)
      .where('version', 1)
      .update({
        name: 'Alice updated name',
        partnerName: 'Acme Corp',
        totalRevenue: 100,
        monthlyRevenue: 10,
        tcv: 120,
        version: 2,
      })

    assert.equal(firstWrite, 1)

    const latestQuote = await Quote.findOrFail(quote.id)
    assert.equal(latestQuote.version, 2)
    assert.equal(latestQuote.name, 'Alice updated name')

    const staleWrite = await Quote.query()
      .where('id', quote.id)
      .where('user_id', userB.id)
      .where('version', 1)
      .update({
        name: 'Bob stale update',
        partnerName: 'Acme Corp',
        totalRevenue: 250,
        monthlyRevenue: 25,
        tcv: 300,
        version: 2,
      })

    assert.equal(staleWrite, 0)

    const quoteAfterConflict = await Quote.findOrFail(quote.id)
    assert.equal(quoteAfterConflict.version, 2)
    assert.equal(quoteAfterConflict.name, 'Alice updated name')
    assert.notEqual(quoteAfterConflict.name, 'Bob stale update')
  })
})
