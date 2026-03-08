export type SingleRouteItem = {
  label: string
  url: string
  icon?: JSX.Element
}

export type GroupRouteItem = {
  label: string
  items: SingleRouteItem[]
}

export const createSingleRouteItem = (
  label: string,
  url: string
): SingleRouteItem => ({ label, url })

export const createGroupRouteItem = (
  label: string,
  items: SingleRouteItem[]
): GroupRouteItem => ({ label, items })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSingleRouteItem = (item: any): item is SingleRouteItem => {
  return typeof item.label === 'string' && typeof item.url === 'string'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGroupRouteItem = (item: any): item is GroupRouteItem => {
  return (
    typeof item.label === 'string' &&
    Array.isArray(item.items) &&
    item.items.length > 0
  )
}
