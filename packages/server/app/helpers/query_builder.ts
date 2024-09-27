import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

export function buildApiQuery(
  modelQuery: any,
  queryData: Record<string, any>,
  tableName: string,
  defaultSearch?: string
) {
  let countQuery = db.from(tableName)
  const limit = queryData['limit']
  const offset = queryData['offset']
  const search = queryData['search']

  if (limit) {
    modelQuery.limit(limit)
  }
  if (offset) {
    modelQuery.offset(offset)
  }

  // Add search functionality to modelQuery
  if (typeof search === 'string' && defaultSearch) {
    modelQuery.whereILike(defaultSearch, search)
    countQuery.whereILike(defaultSearch, search)
  } else if (typeof search === 'object' && search !== null) {
    for (const key in search) {
      if (search.hasOwnProperty(key)) {
        const searchString = '%' + search[key] + '%'
        modelQuery.whereILike(string.camelCase(key), searchString)
        countQuery.whereILike(string.snakeCase(key), searchString)
      }
    }
  }

  return [modelQuery, countQuery]
}
