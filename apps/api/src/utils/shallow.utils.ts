interface ShallowIface<T> {
  source: T
  fields: string[]
  fieldsReplace?: Record<string, any>
  exceptFields?: string[]
}
export const deepCopy = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data))
}

export function shallow<T extends object>({
  source,
  fields,
  fieldsReplace,
  exceptFields,
}: ShallowIface<T>): T {
  const copy = {} as T | any
  for (const key in source) {
    if (fields.includes(key) && !exceptFields?.includes(key)) {
      if (fieldsReplace && fieldsReplace[key]) {
        // We change the key to the new one
        copy[fieldsReplace[key]] = source[key]
      } else {
        copy[key] = source[key]
      }
    }
  }
  // return Object.assign({}, copy);
  return deepCopy<T>(copy)
}

export function isEmptyObject(object: any | null): boolean {
  if (object === null) return true
  return Object.keys(object).length <= 0
}

export function mergeWrappedArrayOnObject(item: any): any[] {
  // Merge a wrapped array on object to an array 1D
  const items = Object.keys(item).map((category) => {
    return item[category]
  })
  return items.length > 0 ? items.reduce((a, b) => a.concat(b)) : []
}

export function findUpdatedItemInList(
  items: any[],
  oldItems: any[],
  fields: any[],
  idField: string | number
): any[] {
  return items
    .map((item) => {
      const indexOld = oldItems.findIndex((d) => d[idField] === item[idField])
      if (indexOld === -1) return null
      const generator = function* () {
        for (const field in fields) {
          if (item[fields[field]] !== oldItems[indexOld][fields[field]]) yield item
        }
      }
      return generator().next().value
    })
    .filter((item) => typeof item !== 'undefined')
}
export const sortArrayObject = <T>(list: T[], property: string, asc: boolean): T[] => {
  return list.sort((a: any, b: any) => {
    const valueA = a[property]
    const valueB = b[property]
    return asc ? valueA - valueB : valueB - valueA
  })
}

export const buildObjectFromVariables = (
  variables: Record<string, any>,
  data: Record<string, any>
): Record<string, any> => {
  const result = {}
  Object.keys(variables).forEach((key) => {
    if (data[key]) result[key] = data[key]
  })
  return result
}

export const replaceContentVariables = (content: string, variables: Record<string, any>) => {
  // Add **data** to the content
  return content.replace(/\[(.*?)\]/g, (match, p1) => {
    return `*${variables[p1] || match}*`
  })
}
