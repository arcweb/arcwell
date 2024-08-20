import { Exception } from '@adonisjs/core/exceptions'

export default class DbForeignKeyConstraintException extends Exception {
  static status = 500
  static code = '23503'
  static type = 'DatabaseError'
  // stack?: string
  // length?: string
  // severity?: string
  // where?: string
  // file?: string
  // line?: string
  // routine?: string
}

export interface DbError {
  status: string
  code: string
  type?: string
  stack?: string
  length?: string
  severity?: string
  where?: string
  file?: string
  line?: string
  routine?: string
}

export function DbExceptionParser(err: DbError) {
  if (err.code === '23503') {
    throw new DbForeignKeyConstraintException()
  }
}
