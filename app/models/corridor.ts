import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Corridor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare versionId: number

  @column()
  declare sourceRowId: string

  @column()
  declare corridorId: number

  @column()
  declare region: string

  @column()
  declare country: string

  @column()
  declare transactionType: string

  @column()
  declare service: string

  @column()
  declare receivingPartner: string

  @column()
  declare payer: string

  @column()
  declare payoutCurrency: string

  @column()
  declare historicalAtv: number

  @column()
  declare atvUsd: number

  @column()
  declare stdFixedFeeUsd: number

  @column()
  declare variableFeePercentage: number

  @column()
  declare fxSource: string

  @column()
  declare defaultFxSpread: number

  @column()
  declare treasuryFxCost: number

  @column()
  declare costFixedPerUsd: number

  @column()
  declare costVariablePerTrx: number

  @column()
  declare needsApproval: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}