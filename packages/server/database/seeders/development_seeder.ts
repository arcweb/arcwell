import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import { PersonFactory } from '#database/factories/person_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']

  async run() {
    const superAdminRole = await Role.findBy('name', 'Super Admin')
    const limitedAdminRole = await Role.findBy('name', 'Limited Admin')
    const guestRole = await Role.findBy('name', 'Guest')

    if (!superAdminRole || !limitedAdminRole || !guestRole) {
      throw new Error('A role not found.  Run the defaults seeder first')
    }

    await User.createMany([
      {
        fullName: 'Super Admin Bob',
        email: 'dev-admin@email.com',
        password: 'Password12345!',
        roleId: superAdminRole.id,
      },
      {
        fullName: 'Limited Admin Barry',
        email: 'dev-limited-admin@email.com',
        password: 'Password12345!',
        roleId: limitedAdminRole.id,
      },
      {
        fullName: 'Guest Billy',
        email: 'dev-guest@email.com',
        password: 'Password12345!',
        roleId: guestRole.id,
      },
    ])

    await PersonFactory.createMany(10)
  }
}
