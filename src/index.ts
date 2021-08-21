import { createNextSprint } from './sprint'
import * as cron from 'node-cron'
import { getActionableTasks } from './tasks'

cron.schedule('0 0 * * *', () => {
  createNextSprint().catch(console.error)
})

cron.schedule('*/1 * * * *', () => {
  getActionableTasks().catch(console.error)
})
