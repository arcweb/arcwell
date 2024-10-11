import Tag from '#models/tag'
import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelObject } from '@adonisjs/lucid/types/model'

export default class AwBaseModel extends BaseModel {
  // Override the serialize method
  serialize(cherryPick?: ModelObject): any {
    // Get the default serialized data
    const serialized = super.serialize(cherryPick)

    // Check if 'tags' property exists and transform it
    if ('tags' in serialized && Array.isArray(serialized.tags)) {
      serialized.tags = serialized.tags.map((tag: Tag) => tag.pathname)
    }

    return serialized
  }
}
