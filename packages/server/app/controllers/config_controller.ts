import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import {
  featureMenuConfig,
  FeatureMenuItem,
  SubfeatureMenuItem,
  FeatureMenuItemNames,
} from '#config/features'
import PersonType from '#models/person_type'
import ResourceType from '#models/resource_type'
import EventType from '#models/event_type'
import FactType from '#models/fact_type'
import db from '@adonisjs/lucid/services/db'
import { installConfigValidator } from '#validators/config'
import { createFactTypeWithTags } from '#controllers/fact_types_controller'
import { createResourceTypeWithTags } from '#controllers/resource_types_controller'

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
  async featuresMenu({ auth }: HttpContext) {
    await auth.authenticate()
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
  async install({ auth, request }: HttpContext) {
    await auth.authenticate()

    const payload = request.body()
    await request.validateUsing(installConfigValidator)

    let counts = {
      fact_types: 0,
      person_types: 0,
      resource_types: 0,
      event_types: 0,
      tags: 0,
      roles: 0,
      users: 0,
    }

    return await db.transaction(async (trx) => {

      if (payload.fact_types && payload.fact_types.length > 0) {
        for (const factTypeData of payload.fact_types) {
          await createFactTypeWithTags(trx, factTypeData, factTypeData.tags);
          counts.fact_types++;
        }
      }

      if (payload.resource_types && payload.resource_types.length > 0) {
        for (const resourceTypeData of payload.resource_types) {
          await createResourceTypeWithTags(trx, resourceTypeData, resourceTypeData.tags);
          counts.resource_types++;
        }
      }

      return { data: counts }
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ }: HttpContext) { }

  /**
   * Show individual record
   */
  async show({ }: HttpContext) { }

  /**
   * Handle form submission for the edit action
   */
  async update({ }: HttpContext) { }

  /**
   * Delete record
   */
  async destroy({ }: HttpContext) { }
}
