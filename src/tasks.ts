import {
  Filter,
  SelectPropertyValue,
} from '@notionhq/client/build/src/api-types'
import { taskActions } from './actions'
import { databases } from './databases'
import { getProperty, notion } from './notion'
import { getCurrentProjects } from './projects'

export async function getTasks(filter?: Filter) {
  const { results } = await notion.databases.query({
    database_id: databases.tasks,
    filter,
  })

  return results
}

export async function getIncompleteTasks(sprintId: string) {
  return await getTasks({
    and: [
      {
        property: 'Sprint',
        relation: {
          contains: sprintId,
        },
      },
      {
        property: 'Done',
        formula: {
          checkbox: {
            equals: false,
          } as any,
        },
      },
    ],
  })
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

export async function getActionableTasks() {
  console.log('Getting tasks')
  const tasks = await getTasks({
    property: 'Actions',
    select: { is_not_empty: true },
  })
  console.log('Got tasks')
  tasks.map((task) => {
    console.log(task.properties.Actions)
    const actionProperty = getProperty<SelectPropertyValue>(task, 'Actions')!
    const action = taskActions[actionProperty.select.name!]
    action?.(task)
  })
  return tasks
}
