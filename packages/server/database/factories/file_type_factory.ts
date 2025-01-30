import FileType from '#models/file_type'
import factory from '@adonisjs/lucid/factories'

export const FileTypeFactory = factory
  .define(FileType, async ({ faker }) => {
    return {
      key: faker.lorem.word(),
      name: faker.lorem.word(),
    }
  })
  .build()
