import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as adonisCoreErrors } from '@adonisjs/core'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as lucidErrors } from '@adonisjs/lucid'
import DbForeignKeyConstrainException from '#exceptions/db_execptions'
// import { errors as bouncerErrors } from '@adonisjs/bouncer'

interface ValidationFrameworkError {
  message: string
  rule: string
  field: string
  meta?: {
    [key: string]: any
  }
}

export interface CustomError {
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

  private transformGenericErrors(customErrors: CustomError[]): {
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
      const newError = this.transformGenericErrors([
        {
          title: 'Route not Found',
          code: error.code ? error.code : 'E_ROUTE_NOT_FOUND',
        },
      ])
      ctx.response.status(404).send(newError)
      return
    }

    if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
      const newError = this.transformGenericErrors([
        {
          title: 'Row not Found',
          code: error.code ? error.code : 'E_ROW_NOT_FOUND',
        },
      ])
      ctx.response.status(404).send(newError)
      return
    }

    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      const newError = this.transformGenericErrors([
        {
          title: 'Unauthorized',
        },
      ])
      ctx.response.status(401).send(newError)
      return
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      const newError = this.transformGenericErrors([
        {
          title: 'Invalid credentials',
          code: error.code ? error.code : 'E_INVALID_CREDENTIALS',
        },
      ])
      ctx.response.status(404).send(newError)
      return
    }

    if (error instanceof adonisCoreErrors.E_HTTP_EXCEPTION) {
      console.log('TODO: handle intentionally thrown exceptions.', error)
      const customError: CustomError = {
        title: error && error.body.title ? error.body.title : 'Unspecified error',
        code: error && error.body.code ? error.body.code : 'E_HTTP_EXCEPTION',
      }

      if (error.body && error.body.detail) {
        customError.detail = error.body.detail
      }

      const newError = this.transformGenericErrors([customError])
      ctx.response.status(error.status ? error.status : 500).send(newError)
      return
    }

    // if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
    // TODO: handle bouncer routing errors. when implemented
    // }

    /**
     * Custom Exceptions handle logic
     */

    if (error instanceof DbForeignKeyConstrainException) {
      console.log('\n\n\n\nForeign key issue', error, '\n\n\n\n')
      const customError: CustomError = {
        title: DbForeignKeyConstrainException.type,
        code: error && error.code ? error.code : 'DB_FOREIGN_KEY_CONSTRAINT',
        detail: error.message,
      }

      const newError = this.transformGenericErrors([customError])
      ctx.response.status(error.status ? error.status : 500).send(newError)
      return
    }

    // if (error instanceof Object) {
    //   const customError: CustomError = {
    //     title: error && error.type ?error.type : 'Database Error',
    //     code: error && error.code ? error.code : 'DB_FOREIGN_KEY_CONSTRAINT',
    //     detail: error.message,
    //   }

    //   const newError = this.transformGenericErrors([customError])
    //   ctx.response.status(error.status ? error.status : 500).send(newError)
    //   return
    // }

    const newError = this.transformGenericErrors([
      {
        title: 'Unknown Exception',
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
    console.log('I CAN REPORT THIS SOMEWHERE!!!!!!', error)
    return super.report(error, ctx)
  }
}
