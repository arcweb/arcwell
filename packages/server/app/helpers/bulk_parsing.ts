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

export async function parseBulkCsv(
  trx: TransactionClientContract,
  file: string,
  typeKey: string,
  modelServiceCall: any
) {
  const data = await new Promise((resolve, reject) => {
    let detail: string
    Papa.parse(file, {
      dynamicTyping: false,
      transform: parseDynamicReturningUndefined,
      header: true,
      skipEmptyLines: true,
      complete: () => {
        if (detail) {
          console.log('AN ERROR: ', detail)
          reject(detail)
        } else {
          trx.commit()
          resolve(undefined)
        }
      },
      error: (error: any) => {
        reject(error)
      },
      step: async (result: any, parser: any) => {
        parser.pause()

        // handle seperated diemntion data
        var objData = {}
        var dimData = []

        for (const key in result.data) {
          if (key.includes('DIM.')) {
            if (result.data[key]) {
              const outKey = key.split('.')[1]
              dimData.push({ key: outKey, value: result.data[key] })
            }
          } else {
            objData = { ...objData, [key]: result.data[key] }
          }
        }

        try {
          let createData: { [x: string]: any } = { ...objData, typeKey: typeKey }
          if (dimData.length > 0) {
            createData = { ...createData, dimensions: dimData }
          }
          await modelServiceCall(trx, createData)
          parser.resume()
        } catch (error) {
          if (env.get('ARCWELL_SERVER_DEBUG_ERRORS') === 'true') {
            detail = error.data
          } else {
            detail = 'Bulk import failed'
          }
          await trx.rollback()
          parser.abort()
        }
      },
    })
  })
  return data
}
