import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Event from '#models/event'
import Resource from '#models/resource'
import Person from '#models/person'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Tag from '#models/tag'
import { getIdsByDimensionQuery } from '#helpers/query_dimensions'

const defaultSearchFields: Record<string, string[]> = {
  cohorts: ['name'],
  event_types: ['name'],
  fact_types: ['name'],
  people: ['family_name', 'given_name'],
  person_types: ['name'],
  resources: ['name'],
  resource_types: ['name'],
  tags: ['pathname'],
  users: ['email'],
}

function getSortSettings(queryData: Record<string, any> = {}) {
  const sort = queryData['sort']
  const order = queryData['order']

  return [sort, order]
}

export async function buildApiQuery({
  modelQuery,
  queryData = { limit: 10, offset: 0 },
  tableName,
}: {
  modelQuery: any
  queryData?: Record<string, any>
  tableName: string
  defaultSearch?: string
}) {
  let countQuery = db.from(tableName)
  const limit = queryData['limit']
  const offset = queryData['offset']
  const searchQuery = queryData['search']
  const filters = queryData['filter']
  const dims = queryData['dim']
  if (filters || dims) {
    const typeTableName = string.singular(tableName) + '_types'
    const result = await getIdsByDimensionQuery(tableName, typeTableName, filters, dims)
    modelQuery.andWhereIn('id', result)
    countQuery.andWhereIn('id', result)
  }

  if (limit) {
    modelQuery.limit(limit)
  }
  if (offset) {
    modelQuery.offset(offset)
  }

  // Searching not supported for Events or Facts. Just ignore for those.
  if (tableName !== 'events' && tableName !== 'facts') {
    let search: any
    // If simple string passed as search param, convert to search object filter so every
    // request uses the same search code mechanism below
    if (typeof searchQuery === 'string') {
      search = {}
      defaultSearchFields[tableName].forEach((key: string) => {
        search[key] = searchQuery
      })
    } else {
      search = searchQuery
    }

    modelQuery.where((query: any) => {
      // Wrap all of this in .where() so the OR clauses generated below will all be enclosed in
      // parentheses in the generated SQL as one logical unit.
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          const searchString = '%' + search[key] + '%'
          // Specify table name with key to avoid ambiguous column reference error when combining
          // query with "types" table. Use OR clause so a match in any specified column will be returned.
          query.orWhere((subQuery: any) => subQuery.whereILike(`${tableName}.${key}`, searchString))
        }
      }
    })
    countQuery.where((query: any) => {
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          const searchString = '%' + search[key] + '%'
          query.orWhere((subQuery: any) => subQuery.whereILike(`${tableName}.${key}`, searchString))
        }
      }
    })
  }

  return [modelQuery, countQuery]
}

// TODO: While these technically work the way they are fine, maybe they
// SHOULD be returning the query object as above?
export function buildEventsSort(
  eventsQuery: ModelQueryBuilderContract<typeof Event, any>,
  queryData: Record<string, any> = {}
) {
  const [sort, order] = getSortSettings(queryData)

  if (sort && order) {
    const camelSortStr = string.camelCase(sort)
    switch (camelSortStr) {
      case 'eventType':
        eventsQuery
          .join('event_types', 'event_types.key', 'events.type_key')
          .orderBy('event_types.name', order)
          .select('events.*')
        break
      case 'person':
        eventsQuery
          .leftOuterJoin('people', 'people.id', 'events.person_id')
          .orderBy('people.family_name', order)
          .select('events.*')
        break
      case 'resource':
        eventsQuery
          .leftOuterJoin('resources', 'resources.id', 'events.resource_id')
          .orderBy('resources.name', order)
          .select('events.*')
        break
      default:
        eventsQuery.orderBy(camelSortStr, order)
    }
  } else {
    eventsQuery.orderBy('startedAt', 'desc')
  }
}

export function buildFactsSort(
  factsQuery: ModelQueryBuilderContract<typeof Event, any>,
  queryData: Record<string, any> = {}
) {
  const [sort, order] = getSortSettings(queryData)

  if (sort && order) {
    const camelSortStr = string.camelCase(sort)
    switch (camelSortStr) {
      case 'factType':
        factsQuery
          .join('fact_types', 'fact_types.key', 'facts.type_key')
          .orderBy('fact_types.name', order)
          .select('facts.*')
        break
      case 'person':
        factsQuery
          .leftOuterJoin('people', 'people.id', 'facts.person_id')
          .orderBy('people.family_name', order)
          .select('facts.*')
        break
      case 'resource':
        factsQuery
          .leftOuterJoin('resources', 'resources.id', 'facts.resource_id')
          .orderBy('resources.name', order)
          .select('facts.*')
        break
      case 'event':
        factsQuery
          .leftOuterJoin('events', 'events.id', 'facts.event_id')
          .orderBy('events.started_at', order)
          .select('facts.*')
        break
      default:
        factsQuery.orderBy(camelSortStr, order)
    }
  } else {
    factsQuery.orderBy('observedAt', 'desc')
  }
}

export function buildPeopleSort(
  peopleQuery: ModelQueryBuilderContract<typeof Person, any>,
  queryData: Record<string, any> = {}
) {
  const [sort, order] = getSortSettings(queryData)

  if (sort && order) {
    const camelSortStr = string.camelCase(sort)
    if (camelSortStr === 'personType') {
      peopleQuery
        .select('people.*')
        .join('person_types', 'person_types.key', 'people.type_key')
        .orderBy('person_types.name', order)
    } else {
      peopleQuery.orderBy(camelSortStr, order)
    }
  } else {
    peopleQuery.orderBy('familyName', 'asc')
    peopleQuery.orderBy('givenName', 'asc')
  }
}

export function buildResourcesSort(
  resourcesQuery: ModelQueryBuilderContract<typeof Resource, any>,
  queryData: Record<string, any> = {}
) {
  const [sort, order] = getSortSettings(queryData)

  if (sort && order) {
    const camelSortStr = string.camelCase(sort)
    if (camelSortStr === 'resourceType') {
      resourcesQuery
        // Need to select the resources columns specifically to avoid aliasing issues with the
        // resource_types columns
        .select('resources.*')
        .join('resource_types', 'resource_types.key', 'resources.type_key')
        .orderBy('resource_types.name', order)
    } else {
      resourcesQuery.orderBy(`resources.${camelSortStr}`, order)
    }
  } else {
    resourcesQuery.orderBy('resources.name', 'asc')
  }
}

export async function setTagsForObject(
  trx: TransactionClientContract,
  objectId: string,
  objectType: string,
  tags: string[],
  isUpdate: boolean = true
) {
  if (isUpdate) {
    // Only delete all existing tags on update. For create request, this is unnecessary.
    await trx.rawQuery(
      'delete from tag_object where object_id = :id and object_type = :objectType',
      {
        id: objectId,
        objectType: objectType,
      }
    )
  }

  for (let tagString of tags) {
    let dbTag = await Tag.findBy('pathname', tagString)
    if (!dbTag) {
      const newTag = new Tag()
      newTag.pathname = tagString
      newTag.useTransaction(trx)
      dbTag = await newTag.save()
    }

    await trx.rawQuery(
      `INSERT INTO public.tag_object
        (id, tag_id, object_id, object_type, created_at, updated_at)
        VALUES(gen_random_uuid(), :tagId, :objectId, :objectType, now(), now());`,
      {
        tagId: dbTag.id,
        objectId: objectId,
        objectType: objectType,
      }
    )
  }
}
