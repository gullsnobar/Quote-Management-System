import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export default class extends BaseSeeder {
  async run() {
    const filePath = app.makePath('sample_corridors.json')

    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      return
    }

    const fileContent = await readFile(filePath, 'utf-8')
    if (!fileContent.trim()) {
      console.error(`File is empty: ${filePath}. Please save sample_corridors.json first.`)
      return
    }

    const records = JSON.parse(fileContent)
    console.log(`Found ${records.length} records in sample_corridors.json. Starting import...`)

    const now = new Date()

    const rows = records.map((item: any) => ({
      version_id: item.versionId,
      source_row_id: String(item.sourceRowId),
      corridor_id: Number(item.corridor_id ?? item.id),
      region: item.region,
      country: item.country,
      transaction_type: item.transactionType,
      service: item.service,
      receiving_partner: item.receivingPartner,
      payer: item.payer,
      payout_currency: item.payoutCurrency,
      historical_atv: item.historicalATV,
      atv_usd: item.atvUSD,
      std_fixed_fee_usd: item.stdFixedFeeUSD,
      variable_fee_percentage: item.variableFeePercentage,
      fx_source: item.fxSource,
      default_fx_spread: item.defaultFxSpread,
      treasury_fx_cost: item.treasuryFxCost,
      cost_fixed_per_usd: item.costFixedPerUSD,
      cost_variable_per_trx: item.costVariablePerTrx,
      needs_approval: Boolean(item.needsApproval),
      created_at: now,
      updated_at: now,
    }))

    // Clean existing records before seeding
    await db.rawQuery('TRUNCATE TABLE corridors RESTART IDENTITY CASCADE')

    // Batch insert in chunks of 500
    const chunkSize = 500
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      await db.table('corridors').multiInsert(chunk)
      console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length} corridors`)
    }

    console.log(`Successfully seeded ${rows.length} corridors!`)
  }
}