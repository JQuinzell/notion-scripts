import { Client } from '@notionhq/client'
import {
  Page,
  Property,
  PropertyValue,
  TitlePropertyValue,
} from '@notionhq/client/build/src/api-types'
import { databases } from './databases'

export const notion = new Client({ auth: process.env.API_KEY })

function isTitleProperty(
  property: PropertyValue
): property is TitlePropertyValue {
  return property.type == 'title'
}

// Can I restrict this to be exactly 1 PropertyValue instead of a subset
// Page uses PropertyValue but the API seems to return a Property in some cases.
// Are the declarations and Property is also returned in Page.properties.Name
export function getProperty<PType extends PropertyValue | Property | undefined>(
  // Why is this Page instead of Database (is the tpe definition correct)
  // Or does it return a page with a database in it
  database: Page,
  name: string
) {
  //Is there a better way to make sure the property is a PType without having to hardcode all the possible values
  const property = (database.properties[name] as PType) || null
  return property
}

export function getTitleProperty(database: Page): TitlePropertyValue {
  const properties = database.properties
  for (const key in properties) {
    const property = properties[key]
    if (isTitleProperty(property)) return property
  }
  throw new Error('Page has have no title')
}

export function getTitleName(database: Page): string {
  const { title } = getTitleProperty(database)
  return title[0]?.plain_text ?? ''
}
