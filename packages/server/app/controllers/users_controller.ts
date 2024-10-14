import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import { paramsUUIDValidator } from '#validators/common'
import { buildApiQuery, setTagsForObject } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'

export function getFullUser(id: string) {
  return User.query()
    .where('id', id)
    .preload('tags')
    .preload('role')
    .preload('person', (person) => {
      person.preload('tags')
      person.preload('personType', (personType) => {
        personType.preload('tags')
      })
    })
    .firstOrFail()
}

export default class UsersController {
  /**
   * @index
   * @summary List Users
   * @description Returns a list of User records
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    let [query, countQuery] = buildApiQuery(User.query(), queryData, 'users')

    query
      .orderBy('email', 'asc')
      .preload('tags')
      .preload('role')
      .preload('person', (person: any) => {
        person.preload('tags')
        person.preload('personType', (personType: any) => {
          personType.preload('tags')
        })
      })

    const queryCount = await countQuery.count('*')

    return {
      data: await query,
      meta: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @show
   * @summary Get User
   * @description Returns an individual User record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await User.query()
        .where('id', params.id)
        .preload('tags')
        .preload('role')
        .preload('person', (person) => {
          person.preload('tags')
          person.preload('personType', (personType) => {
            personType.preload('tags')
          })
        })
        .firstOrFail(),
    }
  }

  /**
   * @store
   * @summary Create User
   * @description Create a new User record within Arcwell
   */
  async store({ request }: HttpContext) {
    // TODO: Add create user functionality back in...
    await request.validateUsing(createUserValidator)
    const responseUser = await db.transaction(async (trx) => {
      const newUser = new User().fill(request.body()).useTransaction(trx)
      await newUser.save()

      const tags = request.only(['tags'])
      if (tags.tags && tags.tags.length > 0) {
        await setTagsForObject(trx, newUser.id, 'users', tags.tags, false)
      }
      return newUser
    })

    return { data: await getFullUser(responseUser.id) }
  }

  /**
   * @update
   * @summary Update User
   * @description Update details of an existing User record within Arcwell
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateUserValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['email', 'roleId', 'tags'])
    const responseUser = await db.transaction(async (trx) => {
      const user = await User.findOrFail(params.id)
      user.useTransaction(trx)
      const updatedUser = await user.merge(cleanRequest).save()

      if (cleanRequest.tags) {
        await setTagsForObject(trx, user.id, 'users', cleanRequest.tags)
      }
      return updatedUser
    })
    return { data: await getFullUser(responseUser.id) }
  }

  /**
   * @destroy
   * @summary Delete User
   * @description Remove a User from this instance of Arcwell
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const user = await User.findOrFail(params.id)
    await user.delete()
    response.status(204).send('')
  }

  /**
   * @invite
   * @summary Invite a User
   * @description Set the user temp password and set the requires password flag, then send an email
   */
  async invite({ request }: HttpContext) {
    console.log('\n\nREQUEST\n\n')
    console.log('\n\nAFTER AUTH\n\n')
    await request.validateUsing(paramsUUIDValidator)
    const cleanRequest = request.only(['id'])

    console.log('\n\nAFTER VALIDATE\n\n')

    let user = await User.findOrFail(cleanRequest.id)

    console.log('\n\nAFTER USER', user)

    User.generateTempPassword(user)
    user.merge({ requiresPasswordChange: true })
    await user.save()

    mail.send((message) => {
      message.to(user.email).subject('You are invited').htmlView('emails/invite', { user })
    })
    return { data: user }
  }
}
