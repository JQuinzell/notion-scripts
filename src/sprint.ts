import { Filter } from '@notionhq/client/build/src/api-types'
import { databases } from './databases'
import { getTitleName, notion } from './notion'

export async function getSprints(filter?: Filter) {
  const { results } = await notion.databases.query({
    database_id: databases.sprints,
    filter,
  })

  return results
}

export async function getCurrentSprint() {
  const sprints = await getSprints({
    property: 'Is Current',
    formula: {
      checkbox: {
        equals: true,
      },
    },
  })
  console.log(sprints.map(getTitleName))
}
