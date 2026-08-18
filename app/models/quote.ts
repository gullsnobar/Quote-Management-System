import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Corridor from '#models/corridor'

export default class Quote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare partnerName: string

  @column()
  declare contractLength: number

  @column()
  declare totalRevenue: number

  @column()
  declare monthlyRevenue: number

  @column()
  declare tcv: number

  @column()
  declare version: number

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Corridor, {
    pivotTable: 'quote_corridors',
    pivotForeignKey: 'quote_id',
    pivotRelatedForeignKey: 'corridor_id',
  })
  declare corridors: ManyToMany<typeof Corridor>
}