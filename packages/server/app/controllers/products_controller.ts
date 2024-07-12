import type {HttpContext} from '@adonisjs/core/http'
import Product from "#models/product";

export default class ProductsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    const products = await Product.all()
    console.log('test2')
    return {
      "status": "success",
      "data": {
        "products": products
      }
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
