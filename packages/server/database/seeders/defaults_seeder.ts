import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { RoleFactory } from '#database/factories/role_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test', 'production']

  async run() {
    await RoleFactory.merge({ name: 'Admin' })
      .with('policies', 1, (builder) =>
        builder.merge([{ name: 'DefaultAdmin', capabilities: '{}' }])
      )
      .create()
  }
}
