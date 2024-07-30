import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as adonisCoreErrors } from '@adonisjs/core'
import { errors as bouncerErrors } from '@adonisjs/bouncer'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as lucidErrors } from '@adonisjs/lucid'

interface ValidationFrameworkError {
  message: string
  rule: string
  field: string
  meta?: {
    [key: string]: any
  }
}

interface CustomError {
  title: string
  detail?: string
  code?: string
  meta?: {
    [key: string]: any
  }
}

export default class HttpExceptionHandler extends ExceptionHandler {
  private transformValidationErrors(
    frameworkErrors: ValidationFrameworkError[],
    code: string
  ): {
    errors: CustomError[]
  } {
    const customErrors = frameworkErrors.map((error) => {
      const customError: CustomError = {
        title: error.rule,
      }
      if (error.message) {
        customError.detail = error.message
      }
      if (code) {
        customError.code = code
      }
      if (error.meta) {
        customError.meta = error.meta
      }
      return customError
    })

    return { errors: customErrors }
  }

  private transformGenericErrorErrors(customErrors: CustomError[]): {
    errors: CustomError[]
  } {
    return { errors: customErrors }
  }

  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      const newError = this.transformValidationErrors(error.messages, error.code)
      ctx.response.status(422).send(newError)
      return
    }

    if (error instanceof adonisCoreErrors.E_ROUTE_NOT_FOUND) {
      const newError = this.transformGenericErrorErrors([
        {
          title: 'Route not Found',
          code: error.code ? error.code : 'E_ROUTE_NOT_FOUND',
          detail: 'Route not Found',
        },
      ])
      ctx.response.status(404).send(newError)
      return
    }

    if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
      const newError = this.transformGenericErrorErrors([
        {
          title: 'Row not Found',
          code: error.code ? error.code : 'E_ROW_NOT_FOUND',
          detail: 'Row not Found',
        },
      ])
      ctx.response.status(404).send(newError)
      return
    }

    if (error instanceof adonisCoreErrors.E_HTTP_EXCEPTION) {
      console.log('TODO: handle http exception core errors.') // TODO return proper format
    }

    if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
      console.log('TODO: handle bouncer routing errors.') // TODO return proper format
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      console.log('TODO: handle auth errors.') // TODO return proper format
    }

    // TODO: Check all others from https://docs.adonisjs.com/guides/references/exceptions

    // console.error('UNHANDLED ERROR: TODO: Add a catch-all generic exception', error)

    const newError = this.transformGenericErrorErrors([
      {
        title: 'Unknown Exception',
        detail: 'Unknown Exception',
      },
    ])
    ctx.response.status(500).send(newError)
    return
    // return super.handle(error, ctx)  // TODO or should we throw this which gives more detail, but uncontrolled format
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    console.log('I AM REPORTING********************************************', error)
    return super.report(error, ctx)
  }
}
