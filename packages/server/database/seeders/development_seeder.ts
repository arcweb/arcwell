import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import { PersonFactory } from '#database/factories/person_factory'
import PersonType from '#models/person_type'
import ResourceType from '#models/resource_type'
import { ResourceFactory } from '#database/factories/resource_factory'
import EventType from '#models/event_type'
import { EventFactory } from '#database/factories/event_factory'
import Tag from '#models/tag'
import { FactFactory } from '#database/factories/fact_factory'
import { FactTypeFactory } from '#database/factories/fact_type_factory'
import { CohortFactory } from '#database/factories/cohort_factory'
import { TagFactory } from '#database/factories/tag_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const superAdminRole = await Role.findBy('name', 'Super Admin')
    const limitedAdminRole = await Role.findBy('name', 'Limited Admin')
    const guestRole = await Role.findBy('name', 'Guest')

    const patientPersonType = await PersonType.findBy('key', 'patient')
    const staffPersonType = await PersonType.findBy('key', 'staff')

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

    const person1 = await PersonFactory.merge({ typeKey: staffPersonType.key }).create()
    const person2 = await PersonFactory.merge({ typeKey: staffPersonType.key }).create()
    const person3 = await PersonFactory.merge({ typeKey: staffPersonType.key }).create()

    await User.createMany([
      {
        email: 'dev-admin@email.com',
        password: 'Password12345!',
        roleId: superAdminRole.id,
        personId: person1.id,
      },
      {
        email: 'dev-limited-admin@email.com',
        password: 'Password12345!',
        roleId: limitedAdminRole.id,
        personId: person2.id,
      },
      {
        email: 'dev-guest@email.com',
        password: 'Password12345!',
        roleId: guestRole.id,
        personId: person3.id,
      },
    ])

    await CohortFactory.merge({ name: 'Arcweb' })
      .with('people', 10, (builder) => {
        builder.merge({ typeKey: staffPersonType.key })
      })
      .create()

    for (let i = 0; i < 10; i++) {
      await PersonFactory.merge({ typeKey: patientPersonType.key }).createMany(10)
    }
    await ResourceFactory.merge({ typeKey: deviceResourceType.key }).createMany(5)
    await ResourceFactory.merge({ typeKey: dmeResourceType.key }).createMany(7)

    for (let i = 0; i < 10; i++) {
      await EventFactory.merge({ typeKey: apptEventType.key, source: 'doctor' }).createMany(10)
    }
    await EventFactory.merge({ typeKey: surgeryEventType.key, source: 'epic' }).createMany(5)

    await Tag.createMany([
      { pathname: 'top/middle' },
      { pathname: 'top/left' },
      { pathname: 'top/right' },
    ])

    for (let i = 0; i < 10; i++) {
      await TagFactory.createMany(10)
    }

    // create data for populating the facts table
    const factType = await FactTypeFactory.merge({
      key: 'blood-pressure',
      name: 'Blood Pressure',
      description: 'A reading from your BP monitor',
    }).create()

    const factType2 = await FactTypeFactory.merge({
      key: 'weight',
      name: 'Weight',
      description: 'Recording of patient weight',
    }).create()

    // const factType2 = await FactTypeFactory.with('dimensionTypes', 8).create()

    const person = await PersonFactory.merge({ typeKey: staffPersonType.key }).create()
    const event = await EventFactory.merge({ typeKey: apptEventType.key }).create()
    const resource = await ResourceFactory.merge({ typeKey: deviceResourceType.key }).create()

    await FactFactory.merge({ typeKey: factType.key }).createMany(2)
    // create a fact with a person, resource, and event
    await FactFactory.merge({
      typeKey: factType.key,
      personId: person.id,
      resourceId: resource.id,
      eventId: event.id,
    })
      .with('dimensions', 6)
      .create()
    // create a fact with just a person
    await FactFactory.merge({ typeKey: factType.key, personId: person.id }).create()
    // create a fact with just a resource
    await FactFactory.merge({ typeKey: factType2.key, resourceId: resource.id }).create()
    // create a fact with just an event
    await FactFactory.merge({ typeKey: factType2.key, eventId: event.id }).create()
  }
}
