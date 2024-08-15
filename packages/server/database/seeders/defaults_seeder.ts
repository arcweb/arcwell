import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { RoleFactory } from '#database/factories/role_factory'
import { PersonTypeFactory } from '#database/factories/person_type_factory'
import { ResourceTypeFactory } from '#database/factories/resource_type_factory'
import { EventTypeFactory } from '#database/factories/event_type_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test', 'production']

  async run() {
    await RoleFactory.merge({ name: 'Super Admin' })
      .with('policies', 3, (builder) =>
        builder.merge([
          { name: 'Policy 1', capabilities: '{ "rule": "whatever"}' },
          { name: 'Policy 2', capabilities: '{}' },
          { name: 'Policy 3', capabilities: '{}' },
        ])
      )
      .create()

    await RoleFactory.merge({ name: 'Limited Admin' })
      .with('policies', 2, (builder) =>
        builder.merge([
          { name: 'Policy 4', capabilities: '{}' },
          { name: 'Policy 5', capabilities: '{}' },
        ])
      )
      .create()

    await RoleFactory.merge({ name: 'Guest' }).create()

    await PersonTypeFactory.merge({ key: 'Patient', name: 'Patient' }).create()
    await PersonTypeFactory.merge({ key: 'Staff', name: 'Staff' }).create()
    await PersonTypeFactory.merge({ key: 'Temp', name: 'Temp' }).create()

    await ResourceTypeFactory.merge({ key: 'device', name: 'Device' }).create()
    await ResourceTypeFactory.merge({ key: 'dme', name: 'DME' }).create()

    await EventTypeFactory.merge({ key: 'appt', name: 'Appointment' }).create()
    await EventTypeFactory.merge({ key: 'surgery', name: 'Surgery' }).create()
  }
}
