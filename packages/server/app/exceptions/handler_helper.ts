import { CustomError } from '#exceptions/handler'
import { errors } from '@adonisjs/core'

/**
 * Throws a custom HTTP error with the specified error details and status code.
 * e.g.
 *     throwCustomHttpError(
 *       {
 *         title: 'A custom error',
 *         code: 'E_HTTP_EXCEPTION',
 *         detail: 'more',
 *       },
 *       418
 *     )
 *
 * @param {CustomError} error - The custom error details.
 * @param {number} status - The HTTP status code to be thrown. Defaults to 500 if not provided.
 * @throws Will throw an E_HTTP_EXCEPTION with the provided error details and status code.
 */
export function throwCustomHttpError(error: CustomError, status: number): void {
  throw errors.E_HTTP_EXCEPTION.invoke(error, status ? status : 500)
}
