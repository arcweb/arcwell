import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { RoleFactory } from '#database/factories/role_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test', 'production']

  async run() {
    await RoleFactory.merge({ name: 'Super Admin' })
      .with('policies', 3, (builder) =>
        builder.merge([
          { name: 'Policy 1', capabilities: '{ "rule": "whatever"}' },
          { name: 'Policy 2', capabilities: '{}' },
          { name: 'Policy 3', capabilities: '{}' },
        ])
      )
      .create()

    await RoleFactory.merge({ name: 'Limited Admin' })
      .with('policies', 2, (builder) =>
        builder.merge([
          { name: 'Policy 4', capabilities: '{}' },
          { name: 'Policy 5', capabilities: '{}' },
        ])
      )
      .create()

    await RoleFactory.merge({ name: 'Guest' }).create()
  }
}
