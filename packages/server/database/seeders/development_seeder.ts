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
import { PersonTypeFactory } from '#database/factories/person_type_factory'
import { ResourceTypeFactory } from '#database/factories/resource_type_factory'
import { EventTypeFactory } from '#database/factories/event_type_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    await PersonTypeFactory.merge({ key: 'patient', name: 'Patient' }).create()
    await PersonTypeFactory.merge({ key: 'staff', name: 'Staff' }).create()
    await PersonTypeFactory.merge({ key: 'temp', name: 'Temp' }).create()

    await ResourceTypeFactory.merge({ key: 'medical-device', name: 'Medical Device' }).create()
    await ResourceTypeFactory.merge({ key: 'room', name: 'Room' }).create()
    await ResourceTypeFactory.merge({ key: 'bed', name: 'Bed' }).create()

    await EventTypeFactory.merge({ key: 'appointment', name: 'Appointment' }).create()
    await EventTypeFactory.merge({ key: 'surgery', name: 'Surgery' }).create()
    await EventTypeFactory.merge({ key: 'intake', name: 'Intake' }).create()
    await EventTypeFactory.merge({ key: 'release', name: 'Release' }).create()

    const superAdminRole = await Role.findBy('name', 'Super Admin')
    const limitedAdminRole = await Role.findBy('name', 'Limited Admin')
    const guestRole = await Role.findBy('name', 'Guest')

    const patientPersonType = await PersonType.findBy('key', 'patient')
    const staffPersonType = await PersonType.findBy('key', 'staff')

    const deviceResourceType = await ResourceType.findBy('key', 'medical-device')
    const roomResourceType = await ResourceType.findBy('key', 'room')

    const apptEventType = await EventType.findBy('key', 'appointment')
    const surgeryEventType = await EventType.findBy('key', 'surgery')

    if (!superAdminRole || !limitedAdminRole || !guestRole) {
      throw new Error('A role not found.  Run the defaults seeder first')
    }

    if (!patientPersonType || !staffPersonType) {
      throw new Error('A person type not found.  Run the defaults seeder first')
    }

    if (!deviceResourceType || !roomResourceType) {
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
        email: 'dev-admin@example.com',
        password: 'password',
        roleId: superAdminRole.id,
        personId: person1.id,
      },
      {
        email: 'dev-limited-admin@example.com',
        password: 'password',
        roleId: limitedAdminRole.id,
        personId: person2.id,
      },
      {
        email: 'dev-guest@example.com',
        password: 'password',
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
    await ResourceFactory.merge({
      typeKey: deviceResourceType.key,
      name: 'Digital Scale',
    }).create()
    await ResourceFactory.merge({
      typeKey: deviceResourceType.key,
      name: 'BP Monitor',
    }).create()
    await ResourceFactory.merge({
      typeKey: roomResourceType.key,
      name: 'ER Room 100',
    }).create()

    for (let i = 0; i < 10; i++) {
      await EventFactory.merge({ typeKey: apptEventType.key }).createMany(10)
    }
    await EventFactory.merge({ typeKey: surgeryEventType.key }).createMany(5)

    await Tag.createMany([
      { pathname: 'measurements' },
      { pathname: 'measurements/diabetes' },
      { pathname: 'measurements/weight' },
    ])

    // for (let i = 0; i < 10; i++) {
    //   await TagFactory.createMany(10)
    // }

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
