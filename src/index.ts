import { Client } from '@notionhq/client'
import { config } from 'dotenv'

config()

const notion = new Client({ auth: process.env.API_KEY })

const databaseId = process.env.TASK_DATABASE_ID

async function get() {
  if (!databaseId) {
    throw 'Set Database id'
  }
  try {
    const cursor = await notion.databases.query({
      database_id: databaseId,
    })
    console.log(cursor.results[0].properties.Name)
  } catch (error) {
    console.log(error)
  }
}

get()
