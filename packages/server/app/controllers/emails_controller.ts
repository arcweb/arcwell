import { paramsEmailValidator } from '#validators/email'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class EmailsController {
  /**
   * @send
   * @summary Send Email
   * @description Send an email message to an address with template
   * @paramQuery email - Destination email address
   * @paramQuery template - Template of body to send email
   */
  async send({ request }: HttpContext) {
    await request.validateUsing(paramsEmailValidator)
    const cleanrequest = request.only(['email', 'template'])

    await mail.send((message) => {
      message.to(cleanrequest.email).text('Hello from arcwell')
    })
  }
}
