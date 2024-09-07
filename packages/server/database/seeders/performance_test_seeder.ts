import { BaseSeeder } from '@adonisjs/lucid/seeders'
// import { TagFactory } from '#database/factories/tag_factory'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    // for (let i = 0; i < 10; i++) {
    //   await TagFactory.createMany(10000)
    // }
  }
}
