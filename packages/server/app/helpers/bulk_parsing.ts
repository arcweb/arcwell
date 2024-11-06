import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import Papa from 'papaparse';

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

export function parseBulkCsv(trx: TransactionClientContract, file: string, modelService: any) {
  Papa.parse(file, {
    dynamicTyping: false,
    transform: parseDynamicReturningUndefined,
    header: true,
    skipEmptyLines: true,
    complete: () => {
      trx.commit()
    },
    step: async (result: any, parser: any) => {
      parser.pause()
      // save the event
      try {
        await modelService.createEvent(trx, result.data)
      } catch (error) {
        await trx.rollback()
        parser.abort()
      } finally {
        parser.resume()
      }
    }
  })
}
