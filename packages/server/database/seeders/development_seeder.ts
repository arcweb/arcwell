import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import { PersonFactory } from '#database/factories/person_factory'
import PersonType from '#models/person_type'
import ResourceType from '#models/resource_type'
import { ResourceFactory } from '#database/factories/resource_factory'
import EventType from '#models/event_type'
import { EventFactory } from '#database/factories/event_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const superAdminRole = await Role.findBy('name', 'Super Admin')
    const limitedAdminRole = await Role.findBy('name', 'Limited Admin')
    const guestRole = await Role.findBy('name', 'Guest')

    const patientPersonType = await PersonType.findBy('key', 'Patient')
    const staffPersonType = await PersonType.findBy('key', 'Staff')

    const deviceResourceType = await ResourceType.findBy('key', 'device')
    const dmeResourceType = await ResourceType.findBy('key', 'dme')

    const apptEventType = await EventType.findBy('key', 'appt')
    const surgeryEventType = await EventType.findBy('key', 'surgery')

    if (!superAdminRole || !limitedAdminRole || !guestRole) {
      throw new Error('A role not found.  Run the defaults seeder first')
    }

    if (!patientPersonType || !staffPersonType) {
      throw new Error('A person type not found.  Run the defaults seeder first')
    }

    if (!deviceResourceType || !dmeResourceType) {
      throw new Error('A resource type not found. Run the default seeder first')
    }

    if (!apptEventType || !surgeryEventType) {
      throw new Error('A event type not found. Run the default seeder first')
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

    await ResourceFactory.merge({ resourceTypeId: deviceResourceType.id }).createMany(5)

    await EventFactory.merge({ eventTypeId: apptEventType.id, source: 'doctor' }).createMany(5)
    await EventFactory.merge({ eventTypeId: surgeryEventType.id, source: 'epic' }).createMany(5)
  }
}
