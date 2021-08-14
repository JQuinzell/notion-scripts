import { getTitleName } from './notion'
import { getProjects } from './projects'
import { getLastSprint } from './sprint'
import { getActionableTasks, getCurrentTasks } from './tasks'

getLastSprint()
  .then((sprint) => console.log(getTitleName(sprint), 'WTF?'))
  .catch(console.error)
