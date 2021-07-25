import { config } from 'dotenv'

config()

function getDatabases() {
  const tasks = process.env.TASK_DATABASE_ID
  if (!tasks) throw 'Task Database not provided'
  const projects = process.env.PROJECTS_DATABASE_ID
  if (!projects) throw 'Projects Database not provided'
  return { tasks, projects }
}

export const databases = getDatabases()
console.log({ databases })
