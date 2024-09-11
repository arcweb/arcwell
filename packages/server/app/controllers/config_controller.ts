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

export default class ConfigController {
  /**
   * Return a list of all features and subfeatures
   */
  async featuresMenu({ auth }: HttpContext) {
    await auth.authenticate()
    // clone the featureMenuConfig so we don't modify the original
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
