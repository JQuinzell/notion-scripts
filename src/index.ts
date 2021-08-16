import { getProperty, getTitleName } from './notion'
import { getProjects } from './projects'
import {
  createNextSprint,
  createSprint,
  getCurrentSprint,
  getLastSprint,
} from './sprint'
import { getActionableTasks, getCurrentTasks } from './tasks'
import * as cron from 'node-cron'
import { DateProperty } from '@notionhq/client/build/src/api-types'
import { addDays, format, formatISO, parseISO } from 'date-fns'

cron.schedule('0 0 * * *', () => {
  console.log('Checking sprint')
  createNextSprint().catch(console.error)
})
// Get last sprint end date
// schedule for time
