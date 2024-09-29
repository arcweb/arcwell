import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import { paramsUUIDValidator } from '#validators/common'
import { buildApiQuery } from '#helpers/query_builder'

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
  async index({ auth, request }: HttpContext) {
    await auth.authenticate()
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
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
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
  async store({ request, auth }: HttpContext) {
    // TODO: Add create user functionality back in...
    await auth.authenticate()
    await request.validateUsing(createUserValidator)
    const newUser = await User.create(request.body())

    return { data: await getFullUser(newUser.id) }
  }

  /**
   * @update
   * @summary Update User
   * @description Update details of an existing User record within Arcwell
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateUserValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['email', 'roleId'])
    const user = await User.findOrFail(params.id)
    const updatedUser = await user.merge(cleanRequest).save()
    return { data: await getFullUser(updatedUser.id) }
  }

  /**
   * @destroy
   * @summary Delete User
   * @description Remove a User from this instance of Arcwell
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const user = await User.findOrFail(params.id)
    await user.delete()
    response.status(204).send('')
  }
}
