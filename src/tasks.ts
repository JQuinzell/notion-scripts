import {
  Filter,
  RelationProperty,
  SelectPropertyValue,
} from '@notionhq/client/build/src/api-types'
import { databases } from './databases'
import { getProperty, getTitleName, getTitleProperty, notion } from './notion'
import { getCurrentProjects } from './projects'

export async function getTasks(filter?: Filter) {
  const { results } = await notion.databases.query({
    database_id: databases.tasks,
    filter,
  })

  return results
}

function existsPredicate<T>(val: T): val is T {
  return !!val
}

export async function getCurrentTasks() {
  const results = await getCurrentProjects()
  const ids = results.map(({ id }) => id)
  const tasks = await getTasks({
    or: ids.map((id) => ({
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
    //   [
    //   {
    //     property: 'Project',
    //     relation: {
    //       contains: 'Apply for Jobs',
    //     },
    //   },
    // ],
  })

  console.log(tasks.map(getTitleName))
}
