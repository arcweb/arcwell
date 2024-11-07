import env from '#start/env'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Papa from 'papaparse'

export function parseDynamicReturningUndefined(value: any) {
  if (value === 'true' || value === 'TRUE') {
    return true
  } else if (value === 'false' || value === 'FALSE') {
    return false
  } else {
    const val = value === '' ? undefined : value
    return val
  }
}

export function parseBulkCsv(trx: TransactionClientContract, file: string, typeKey: string, modelServiceCall: any): string | void {
  Papa.parse(file, {
    dynamicTyping: false,
    transform: parseDynamicReturningUndefined,
    header: true,
    skipEmptyLines: true,
    complete: () => {
      trx.commit()
      return
    },
    step: async (result: any, parser: any) => {
      parser.pause()
      try {
        await modelServiceCall(trx, { ...result.data, typeKey: typeKey })
      } catch (error) {
        let detail
        if (env.get('ARCWELL_SERVER_DEBUG_ERRORS') === 'true') {
          detail = error.data
        } else {
          detail = 'Bulk import failed'
        }
        await trx.rollback()
        parser.abort()
        return detail
      } finally {
        parser.resume()
      }
    },
  })
}
