import { BaseSeeder } from '@adonisjs/lucid/seeders'
import {ProductFactory} from "#database/factories/product_factory";

export default class extends BaseSeeder {

  static environment = ['development', 'testing']

  async run() {
    // Write your database queries inside the run method
    await ProductFactory.createMany(100)
  }
}
