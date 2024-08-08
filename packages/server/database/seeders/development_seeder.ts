import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import { PersonFactory } from '#database/factories/person_factory'
import PersonType from '#models/person_type'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']

  async run() {
    const superAdminRole = await Role.findBy('name', 'Super Admin')
    const limitedAdminRole = await Role.findBy('name', 'Limited Admin')
    const guestRole = await Role.findBy('name', 'Guest')

    const patientPersonType = await PersonType.findBy('key', 'Patient')
    const staffPersonType = await PersonType.findBy('key', 'Staff')

    if (!superAdminRole || !limitedAdminRole || !guestRole) {
      throw new Error('A role not found.  Run the defaults seeder first')
    }

    if (!patientPersonType || !staffPersonType) {
      throw new Error('A person type not found.  Run the defaults seeder first')
    }

    await User.createMany([
      {
        email: 'dev-admin@email.com',
        password: 'Password12345!',
        roleId: superAdminRole.id,
        personId: (await PersonFactory.merge({ personTypeId: staffPersonType.id }).create()).id,
      },
      {
        email: 'dev-limited-admin@email.com',
        password: 'Password12345!',
        roleId: limitedAdminRole.id,
        personId: (await PersonFactory.merge({ personTypeId: staffPersonType.id }).create()).id,
      },
      {
        email: 'dev-guest@email.com',
        password: 'Password12345!',
        roleId: guestRole.id,
        personId: (await PersonFactory.merge({ personTypeId: staffPersonType.id }).create()).id,
      },
    ])

    await PersonFactory.merge({ personTypeId: patientPersonType.id }).createMany(5)
  }
}
