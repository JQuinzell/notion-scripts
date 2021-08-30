import {
  Filter,
  SelectPropertyValue,
} from '@notionhq/client/build/src/api-types'
import { taskActions } from './actions'
import { databases } from './databases'
import { getProperty, getTitleName, notion } from './notion'
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
  const tasks = await getTasks({
    and: [
      {
        property: 'Action',
        select: { is_not_empty: true },
      },
      {
        property: 'Action',
        select: { does_not_equal: 'None' },
      },
    ],
  })
  await Promise.all(
    tasks.map(async (task) => {
      const actionProperty = getProperty<SelectPropertyValue>(task, 'Action')!
      const actionName = actionProperty.select.name!
      const action = taskActions[actionName]
      if (action) {
        console.log(
          `Performing action ${actionName} on task ${getTitleName(task)}`
        )
        await action?.(task)
        await notion.pages.update({
          page_id: task.id,
          properties: {
            Action: {
              type: 'select',
              select: {
                name: 'None',
              },
            },
          },
          archived: false,
        })
      } else {
        console.log('No action', actionName)
      }
    })
  )
  return tasks
}
