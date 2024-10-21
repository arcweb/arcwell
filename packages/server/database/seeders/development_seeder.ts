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
    await Tag.createMany([
      { pathname: 'measurements' },
      { pathname: 'measurements/diabetes' },
      { pathname: 'measurements/weight' },
    ])

    await PersonTypeFactory.merge({ key: 'patient', name: 'Patient' }).create()
    await PersonTypeFactory.merge({ key: 'staff', name: 'Staff' }).create()
    await PersonTypeFactory.merge({ key: 'temp', name: 'Temp' }).create()

    await ResourceTypeFactory.merge({
      key: 'medical-device',
      name: 'Medical Device',
      dimensionSchemas: [],
    }).create()
    await ResourceTypeFactory.merge({ key: 'room', name: 'Room', dimensionSchemas: [] }).create()
    await ResourceTypeFactory.merge({ key: 'bed', name: 'Bed', dimensionSchemas: [] }).create()

    await EventTypeFactory.merge({
      key: 'appointment',
      name: 'Appointment',
    }).create()
    await EventTypeFactory.merge({ key: 'surgery', name: 'Surgery' }).create()
    await EventTypeFactory.merge({ key: 'intake', name: 'Intake' }).create()
    await EventTypeFactory.merge({ key: 'release', name: 'Release' }).create()

    const adminRole = await Role.findBy('name', 'Admin')

    const patientPersonType = await PersonType.findBy('key', 'patient')
    const staffPersonType = await PersonType.findBy('key', 'staff')

    const deviceResourceType = await ResourceType.findBy('key', 'medical-device')
    const roomResourceType = await ResourceType.findBy('key', 'room')

    const apptEventType = await EventType.findBy('key', 'appointment')
    const surgeryEventType = await EventType.findBy('key', 'surgery')

    if (!adminRole) {
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

    const person1 = await PersonFactory.merge({
      typeKey: staffPersonType.key,
    }).create()

    await User.createMany([
      {
        email: 'admin@example.com',
        password: 'example-healthy-pass',
        roleId: adminRole.id,
        personId: person1.id,
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

    // for (let i = 0; i < 10; i++) {
    //   await TagFactory.createMany(10)
    // }

    // create data for populating the facts table
    const factType = await FactTypeFactory.merge({
      key: 'blood-pressure',
      name: 'Blood Pressure',
      description: 'A reading from your BP monitor',
      dimensionSchemas: [
        { name: 'Diastolic', key: 'diastolic', dataType: 'number', dataUnit: '', isRequired: true },
        { name: 'Systolic', key: 'systolic', dataType: 'number', dataUnit: '', isRequired: true },
        {
          name: 'Heart Rate',
          key: 'heart_rate',
          dataType: 'number',
          dataUnit: '',
          isRequired: false,
        },
      ],
    }).create()

    const factType2 = await FactTypeFactory.merge({
      key: 'weight',
      name: 'Weight',
      description: 'Recording of patient weight',
      dimensionSchemas: [
        { name: 'Weight', key: 'weight', dataType: 'number', dataUnit: 'lbs', isRequired: true },
        {
          name: 'Heart Rate',
          key: 'heart_rate',
          dataType: 'number',
          dataUnit: '',
          isRequired: false,
        },
        {
          name: 'Provider Name',
          key: 'provider',
          dataType: 'string',
          dataUnit: '',
          isRequired: false,
        },
      ],
    }).create()

    // const factType2 = await FactTypeFactory.with('dimensionSchemas', 8).create()

    const person = await PersonFactory.merge({
      typeKey: staffPersonType.key,
    }).create()
    const event = await EventFactory.merge({
      typeKey: apptEventType.key,
    }).create()
    const resource = await ResourceFactory.merge({
      typeKey: deviceResourceType.key,
    }).create()

    await FactFactory.merge({
      typeKey: factType.key,
      dimensions: [
        { key: 'diastolic', value: 85 },
        { key: 'systolic', value: 135 },
        { key: 'heart_rate', value: 82 },
      ],
    })
      // .with('tags', 3)
      .create()
    await FactFactory.merge({
      typeKey: factType.key,
      dimensions: [
        { key: 'diastolic', value: 90 },
        { key: 'systolic', value: 145 },
      ],
    }).create()
    // create a fact with a person, resource, and event
    await FactFactory.merge({
      typeKey: factType.key,
      personId: person.id,
      resourceId: resource.id,
      eventId: event.id,
      dimensions: [
        { key: 'diastolic', value: 80 },
        { key: 'systolic', value: 120 },
        { key: 'heart_rate', value: 74 },
      ],
    }).create()
    // create a fact with just a person
    await FactFactory.merge({
      typeKey: factType.key,
      personId: person.id,
      dimensions: [
        { key: 'diastolic', value: 75 },
        { key: 'systolic', value: 115 },
        { key: 'heart_rate', value: 68 },
      ],
    }).create()
    // create a fact with just a resource
    await FactFactory.merge({
      typeKey: factType2.key,
      resourceId: resource.id,
      dimensions: [
        { key: 'weight', value: 190 },
        { key: 'heart_rate', value: 78 },
        { key: 'provider', value: 'Dr. Simon Reed' },
      ],
    }).create()
    // create a fact with just an event
    await FactFactory.merge({
      typeKey: factType2.key,
      eventId: event.id,
      dimensions: [
        { key: 'weight', value: 150 },
        { key: 'heart_rate', value: 88 },
      ],
    }).create()
  }
}
