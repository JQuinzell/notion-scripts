import { Page } from '@notionhq/client/build/src/api-types'
import { getTitleName } from './notion'
import { addTaskToCurrentSprint, removeTaskFromCurrentSprint } from './sprint'

interface ActionMap {
  [name: string]: ((page: Page) => Promise<void>) | undefined
}

export const taskActions: ActionMap = {
  async 'Add to sprint'(task: Page) {
    await addTaskToCurrentSprint(task.id)
    console.log(`Added task ${getTitleName(task)} to current sprint`)
  },
  async 'Remove from sprint'(task: Page) {
    await removeTaskFromCurrentSprint(task.id)
    console.log(`Removed task ${getTitleName(task)} from current sprint`)
  },
}
