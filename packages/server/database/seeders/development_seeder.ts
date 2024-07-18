import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']

  async run() {
    await User.create({
      fullName: 'Developer Admin',
      email: 'dev-admin@email.com',
      password: 'Password12345!',
    })
  }
}
