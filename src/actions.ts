import { Page } from '@notionhq/client/build/src/api-types'
import { getTitleName } from './notion'
import { addTaskToCurrentSprint } from './sprint'

interface ActionMap {
  [name: string]: ((page: Page) => Promise<void>) | undefined
}

export const taskActions: ActionMap = {
  async 'Add to sprint'(task: Page) {
    await addTaskToCurrentSprint(task.id)
    console.log(`Added task ${getTitleName(task)} to current sprint`)
  },
}
