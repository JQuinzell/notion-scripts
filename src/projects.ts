import {
  Filter,
  SelectPropertyValue,
} from '@notionhq/client/build/src/api-types'
import { databases } from './databases'
import { getProperty, getTitleName, notion } from './notion'

// TODO: Need ways to continue querying if results are on another page
export async function getProjects(filter?: Filter) {
  const { results } = await notion.databases.query({
    database_id: databases.projects,
    filter,
  })

  return results
}

export function getCurrentProjects() {
  return getProjects({
    property: 'Status',
    select: {
      equals: 'Current',
    },
  })
}
