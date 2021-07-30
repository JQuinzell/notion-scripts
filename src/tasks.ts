import { Filter } from '@notionhq/client/build/src/api-types'
import { databases } from './databases'
import { notion } from './notion'
import { getCurrentProjects } from './projects'

export async function getTasks(filter?: Filter) {
  const { results } = await notion.databases.query({
    database_id: databases.tasks,
    filter,
  })

  return results
}

export async function getCurrentTasks() {
  const currentProjects = await getCurrentProjects()
  const projectIds = currentProjects.map(({ id }) => id)
  const tasks = await getTasks({
    or: projectIds.map((id) => ({
      and: [
        {
          property: 'Project',
          relation: {
            contains: id,
          },
        },
        {
          property: 'Done',
          checkbox: {
            equals: false,
          },
        },
      ],
    })),
  })

  return tasks
}
