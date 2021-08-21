import { createNextSprint } from './sprint'
import * as cron from 'node-cron'
import { getActionableTasks } from './tasks'
import { notion } from './notion'

cron.schedule('0 0 * * *', () => {
  createNextSprint().catch(console.error)
})

cron.schedule('*/1 * * * *', () => {
  getActionableTasks().catch(console.error)
})
