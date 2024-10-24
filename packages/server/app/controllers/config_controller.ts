import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import {
  featureMenuConfig,
  FeatureMenuItem,
  SubfeatureMenuItem,
  FeatureMenuItemNames,
} from '#config/features'
import EventType from '#models/event_type'
import FactType from '#models/fact_type'
import PersonType from '#models/person_type'
import ResourceType from '#models/resource_type'
import Role from '#models/role'
import Tag from '#models/tag'
import User from '#models/user'
import { installConfigValidator } from '#validators/config'
import FactTypeService from '#services/fact_type_service'
import EventTypeService from '#services/event_type_service'
import PersonTypeService from '#services/person_type_service'
import ResourceTypeService from '#services/resource_type_service'
import RoleService from '#services/role_service'
import TagService from '#services/tag_service'
import UserService from '#services/user_service'
import Person from '#models/person'
import PersonService from '#services/person_service'

export default class ConfigController {
  /**
   * @index
   * @summary Config Index
   * @description Returns a set of public server configuration fields for introspection by integrating apps.
   */
  async index() {
    return {
      arcwell: {
        name: env.get('ARCWELL_INSTANCE_NAME'),
        id: env.get('ARCWELL_INSTANCE_ID'),
      },
      mail: {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        fromAddress: env.get('SMTP_FROM_ADDRESS'),
        fromName: env.get('SMTP_FROM_NAME'),
      },
    }
  }

  /**
   * @featuresMenu
   * @summary Features Menu
   * @description Returns a nested list representing all current top-level features and sub-features/types active in Arcwell.
   */
  async featuresMenu({}: HttpContext) {
    // clone the featureMenuConfig so we don't modify the original
    // TODO: Find a better way to clone the featureMenuConfig
    const featuresBaseMenuConfig = JSON.parse(JSON.stringify(featureMenuConfig))

    const personTypeQuery = await PersonType.query().select('name', 'key').orderBy('name', 'asc')
    const personTypeSubFeatures: SubfeatureMenuItem[] = personTypeQuery.map((personType) => ({
      name: personType.name,
      path: `list/${personType.key}`,
    }))

    const resourceTypeQuery = await ResourceType.query()
      .select('name', 'key')
      .orderBy('name', 'asc')
    const resourceTypeSubfeatures: SubfeatureMenuItem[] = resourceTypeQuery.map((resourceType) => ({
      name: resourceType.name,
      path: `list/${resourceType.key}`,
    }))

    const eventTypeQuery = await EventType.query().select('name', 'key').orderBy('name', 'asc')
    const eventTypeSubfeatures: SubfeatureMenuItem[] = eventTypeQuery.map((eventType) => ({
      name: eventType.name,
      path: `list/${eventType.key}`,
    }))

    const factTypeQuery = await FactType.query().select('name', 'key').orderBy('name', 'asc')
    const factTypeSubFeatures: SubfeatureMenuItem[] = factTypeQuery.map((factType) => ({
      name: factType.name,
      path: `list/${factType.key}`,
    }))
    // TODO: Add tag types when they are implemented
    // const tagTypeQuery = await TagType.query()

    const featureMenuConfigWithTypes: FeatureMenuItem[] = featuresBaseMenuConfig.map(
      (feature: FeatureMenuItem) => {
        if (feature.name === FeatureMenuItemNames.People) {
          feature.subfeatures = [...feature.subfeatures, ...personTypeSubFeatures]
        } else if (feature.name === FeatureMenuItemNames.Resources) {
          feature.subfeatures = [...feature.subfeatures, ...resourceTypeSubfeatures]
        } else if (feature.name === FeatureMenuItemNames.Events) {
          feature.subfeatures = [...feature.subfeatures, ...eventTypeSubfeatures]
        } else if (feature.name === FeatureMenuItemNames.Facts) {
          feature.subfeatures = [...feature.subfeatures, ...factTypeSubFeatures]
        }
        return feature
      }
    )

    return { data: featureMenuConfigWithTypes }
  }

  /**
   * @installData
   * @summary Install Seed Data
   * @description Allows third-party developers to install seed data for various types into Arcwell.
   * This method handles fact_types, person_types, resource_types, event_types, tags, roles, users.
   */
  async install({ request }: HttpContext) {
    const payload = request.body()
    await request.validateUsing(installConfigValidator)

    const { returnObjects } = request.qs()
    const shouldReturnObjects = returnObjects === 'true'

    let counts = {
      fact_types: 0,
      people: 0,
      person_types: 0,
      resource_types: 0,
      event_types: 0,
      tags: 0,
      roles: 0,
      users: 0,
    }

    let createdObjects = {
      fact_types: [] as FactType[],
      people: [] as Person[],
      person_types: [] as PersonType[],
      resource_types: [] as ResourceType[],
      event_types: [] as EventType[],
      tags: [] as Tag[],
      roles: [] as Role[],
      users: [] as User[],
    }

    return db.transaction(async (trx) => {
      if (payload.event_types && payload.event_types.length > 0) {
        for (const eventTypeData of payload.event_types) {
          const createdEventType = await EventTypeService.createEventType(
            trx,
            eventTypeData,
            eventTypeData.tags
          )
          counts.event_types++

          if (shouldReturnObjects) {
            createdObjects.event_types.push(createdEventType)
          }
        }
      }

      if (payload.fact_types && payload.fact_types.length > 0) {
        for (const factTypeData of payload.fact_types) {
          const createdFactType = await FactTypeService.findOrCreateFactTypeByKey(trx, factTypeData)
          counts.fact_types++

          if (shouldReturnObjects) {
            createdObjects.fact_types.push(createdFactType)
          }
        }
      }

      if (payload.people && payload.people.length > 0) {
        for (const personData of payload.people) {
          const createdPerson = await PersonService.findOrCreatePerson(trx, personData)
          counts.people++

          if (shouldReturnObjects) {
            const fullPerson = await PersonService.getFullPerson(createdPerson.id, 10, 0, trx)
            createdObjects.people.push(fullPerson)
          }
        }
      }

      if (payload.person_types && payload.person_types.length > 0) {
        for (const personTypeData of payload.person_types) {
          const personType = await PersonTypeService.findOrCreatePersonTypeByKey(
            trx,
            personTypeData
          )

          counts.person_types++

          if (shouldReturnObjects) {
            const fullPersonType = await PersonTypeService.getFullPersonType(personType.id, trx)
            createdObjects.person_types.push(fullPersonType)
          }
        }
      }

      if (payload.resource_types && payload.resource_types.length > 0) {
        for (const resourceTypeData of payload.resource_types) {
          const createdResourceType = await ResourceTypeService.findOrCreateResourceTypeByKey(
            trx,
            resourceTypeData
          )
          counts.resource_types++

          if (shouldReturnObjects) {
            const fullResourceType = await ResourceTypeService.getFullResourceType(
              createdResourceType.id,
              trx
            )
            createdObjects.resource_types.push(fullResourceType)
          }
        }
      }

      if (payload.roles && payload.roles.length > 0) {
        for (const roleData of payload.roles) {
          const createdRole = await RoleService.findOrCreateRoleByName(trx, roleData)
          counts.roles++

          if (shouldReturnObjects) {
            const fullRole = await RoleService.getFullRole(createdRole.id, trx)
            createdObjects.roles.push(fullRole)
          }
        }
      }

      if (payload.tags && payload.tags.length > 0) {
        for (const tagData of payload.tags) {
          const createdTag = await TagService.findOrCreateTag(trx, tagData)
          counts.tags++

          if (shouldReturnObjects) {
            createdObjects.tags.push(createdTag)
          }
        }
      }

      if (payload.users && payload.users.length > 0) {
        for (const userData of payload.users) {
          const createdUser = await UserService.findOrCreateUserByEmail(trx, userData)
          counts.users++

          if (shouldReturnObjects) {
            const fullUser = await UserService.getFullUser(createdUser.id, trx)
            createdObjects.users.push(fullUser)
          }
        }
      }

      return { data: { counts, createdObjects } }
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({}: HttpContext) {}

  /**
   * Show individual record
   */
  async show({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}
