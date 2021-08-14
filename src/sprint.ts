import { Filter, RelationProperty } from '@notionhq/client/build/src/api-types'
import { databases } from './databases'
import { getProperty, getTitleName, notion } from './notion'

const queryParams = { database_id: databases.sprints }

export async function getSprints(filter?: Filter) {
  const { results } = await notion.databases.query({
    ...queryParams,
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
  const [sprint] = sprints
  if (!sprint) throw new Error('No Current Sprint')
  if (sprints.length > 1) throw new Error('More than 1 current sprint')
  return sprint
}

export async function getLastSprint() {
  console.log('getting last sprint')
  const { results } = await notion.databases.query({
    ...queryParams,
    sorts: [
      {
        property: 'Date Range',
        direction: 'descending',
      },
    ],
    page_size: 1,
  })
  return results[0]
}

export async function addTaskToCurrentSprint(taskId: string) {
  const currentSprint = await getCurrentSprint()
  // The type doesn't have the same value as the API result
  const existingRelation =
    (getProperty<RelationProperty>(currentSprint, 'Tasks')
      ?.relation as unknown as any[]) || []
  // This type is also wrong?
  const Tasks = [...existingRelation, { id: taskId }] as any
  console.log(Tasks)
  await notion.pages.update({
    page_id: taskId,
    properties: {
      Tasks,
    },
    archived: false,
  })
}
