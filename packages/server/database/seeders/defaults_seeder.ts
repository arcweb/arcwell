import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'

export default class extends BaseSeeder {
  static environment = ['development', 'testing', 'production']

  async run() {
    await Role.createMany([
      {
        name: 'Super Admin',
      },
      {
        name: 'Limited Admin',
      },
      {
        name: 'Guest',
      },
    ])
  }
}
