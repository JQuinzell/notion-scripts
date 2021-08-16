import {
  DatePropertyValue,
  Filter,
  FormulaFilter,
  RelationProperty,
} from '@notionhq/client/build/src/api-types'
import { addDays, format, formatISO, isToday, parseISO } from 'date-fns'
import { databases } from './databases'
import { getProperty, notion } from './notion'

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
  date: DatePropertyValue['date']
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
      'Date Range': {
        type: 'date',
        date,
      },
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
  if (!isToday(newStartDate)) {
    console.log('Not time for new sprint yet')
    return
  }

  const newEndDate = addDays(newStartDate, 13)
  const sprintTitle = format(newStartDate, 'M/d/yyy')
  const newDateRange = {
    start: format(newStartDate, 'yyyy-MM-dd'),
    end: format(newEndDate, 'yyyy-MM-dd'),
  }
  await createSprint(sprintTitle, newDateRange)
  console.log(
    `Created sprint from ${newDateRange.start} to ${newDateRange.end}`
  )
}

export async function getCurrentSprint() {
  const sprints = await getSprints({
    property: 'Is Current',
    formula: {
      checkbox: {
        equals: true,
        // Notion types are wrong.
      } as unknown as FormulaFilter['formula']['checkbox'],
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
