export type MetaType = {
  page: number
  num: number
  itemCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
export interface IPaginatedData<T> {
  content: T[]
  meta: MetaType
}

export type PaginateOptionParams = {
  page?: number
  num?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}
