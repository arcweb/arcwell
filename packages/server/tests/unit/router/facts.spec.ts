import Fact from '#models/fact'
import FactType from '#models/fact_type'
import Person from '#models/person'
import User from '#models/user'
import { test } from '@japa/runner'

const FACTS_URL = '/facts'

test.group('Router facts', () => {
  test('facts index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(FACTS_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 6)
    assert.equal(data.meta.count, 6)
  })

  test('facts index no auth test', async ({ client }) => {
    const response = await client.get(FACTS_URL)

    response.assertStatus(401)
  })

  test('facts index count test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${FACTS_URL}/count`).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.count, 6)
  })

  test('facts show test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const fact = await Fact.first()

    const response = await client.get(`${FACTS_URL}/${fact?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, fact?.id)
    assert.equal(data.data.typeKey, fact?.typeKey)
  })

  test('facts store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const type = await FactType.findByOrFail('key', 'weight')

    const newFact = {
      typeKey: type!.key,
      dimensions: [{ key: 'weight', value: 123 }],
    }
    const response = await client
      .post(`${FACTS_URL}`)
      .json({ ...newFact })
      .loginAs(adminUser!)

    console.log(response)
    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.typeKey, newFact.typeKey)
  })

  test('fact update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const person = await Person.first()
    const fact = await Fact.first()
    const newData = {
      personId: person!.id,
    }
    const response = await client
      .patch(`${FACTS_URL}/${fact?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, fact!.id)
    assert.equal(data.data.personId, newData.personId)
  })

  test('fact destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const fact = await Fact.first()

    const response = await client.delete(`${FACTS_URL}/${fact?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  })
})
