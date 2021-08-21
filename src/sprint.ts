import {
  DatePropertyValue,
  Filter,
  RelationProperty,
} from '@notionhq/client/build/src/api-types'
import { addDays, format, isBefore, parseISO } from 'date-fns'
import { databases } from './databases'
import { getProperty, notion } from './notion'
import { getIncompleteTasks } from './tasks'

const queryParams = { database_id: databases.sprints }

export async function getSprints(filter?: Filter) {
  const { results } = await notion.databases.query({
    ...queryParams,
    filter,
  })

  return results
}

export async function createSprint(
  title: string,
  date: DatePropertyValue['date'],
  taskIds: Array<{ id: string }>
) {
  await notion.pages.create({
    parent: queryParams,
    properties: {
      Name: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: title,
            },
          },
        ],
      },
      'Is Current': {
        type: 'checkbox',
        checkbox: true,
      },
      'Date Range': {
        type: 'date',
        date,
      },
      // TODO: why is this type wrong
      Tasks: {
        type: 'relation',
        relation: taskIds,
      } as any,
    },
  })
}

export async function createNextSprint() {
  const sprint = await getCurrentSprint()
  const oldDateRange = getProperty<DatePropertyValue>(sprint, 'Date Range')
  if (!oldDateRange) throw new Error('No date range for sprint')
  if (!oldDateRange.date.end) throw new Error('No end date for sprint')

  const oldEndDate = parseISO(oldDateRange.date.end)
  const newStartDate = addDays(oldEndDate, 1)
  const today = new Date()
  if (isBefore(today, newStartDate)) {
    console.log('Not time for new sprint yet')
    return
  }
  const newEndDate = addDays(newStartDate, 13)
  const sprintTitle = format(newStartDate, 'M/d/yyy')
  const newDateRange = {
    start: format(newStartDate, 'yyyy-MM-dd'),
    end: format(newEndDate, 'yyyy-MM-dd'),
  }
  const tasks = await getIncompleteTasks(sprint.id)
  const taskIds = tasks.map(({ id }) => ({ id }))
  await setSprintCurrent(sprint.id, false)
  await createSprint(sprintTitle, newDateRange, taskIds)
  console.log(
    `Created sprint from ${newDateRange.start} to ${newDateRange.end}`
  )
}

export async function getCurrentSprint() {
  const sprints = await getSprints({
    property: 'Is Current',
    checkbox: {
      equals: true,
    },
  })
  const [sprint] = sprints
  if (!sprint) throw new Error('No Current Sprint')
  if (sprints.length > 1) throw new Error('More than 1 current sprint')
  return sprint
}

export async function setSprintCurrent(id: string, isCurrent: boolean) {
  await notion.pages.update({
    page_id: id,
    archived: false,
    properties: {
      'Is Current': {
        type: 'checkbox',
        checkbox: isCurrent,
      },
    },
  })
}

export async function getLastSprint() {
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

export async function setSprintTasks(
  sprintId: string,
  taskIds: Array<{ id: string }>
) {
  await notion.pages.update({
    page_id: sprintId,
    properties: {
      //TODO: figure out type for this
      Tasks: taskIds as any,
    },
    archived: false,
  })
}

export async function addTaskToCurrentSprint(taskId: string) {
  const currentSprint = await getCurrentSprint()
  // The type doesn't have the same value as the API result
  const existingRelation =
    (getProperty<RelationProperty>(currentSprint, 'Tasks')
      ?.relation as unknown as any[]) || []
  const taskIds = [...existingRelation, { id: taskId }]
  await setSprintTasks(currentSprint.id, taskIds)
}
