import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const testUser = await User.findBy('email', 'test@example.com')
    if (!testUser) {
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
    }

    const gullUser = await User.findBy('email', 'gull.devyard12@gmail.com')
    if (!gullUser) {
      await User.create({
        fullName: 'Gull Deyvard',
        email: 'gull.devyard12@gmail.com',
        password: 'password123',
      })
    }
  }
}
