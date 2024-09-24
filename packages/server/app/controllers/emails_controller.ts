import { paramsEmailValidator } from '#validators/email'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class EmailsController {
  /**
   * Send an email with a addressa and template
   */
  async send({ request }: HttpContext) {
    await request.validateUsing(paramsEmailValidator)
    const cleanrequest = request.only(['email', 'template'])
    console.log('recieved email request')
    console.log('email ', cleanrequest)

    await mail.send((message) => {
      message.to(cleanrequest.email).text('Hello from arcwell')
    })
  }
}
