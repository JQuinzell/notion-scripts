import { getTitleName } from './notion'
import { getProjects } from './projects'
import { addTaskToCurrentSprint, getCurrentSprint } from './sprint'
import { getActionableTasks, getCurrentTasks } from './tasks'

console.log('index')
getActionableTasks()
