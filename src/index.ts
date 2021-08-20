import { createNextSprint } from './sprint'
import * as cron from 'node-cron'

cron.schedule('0 0 * * *', () => {
  console.log('Checking sprint')
  createNextSprint().catch(console.error)
})
