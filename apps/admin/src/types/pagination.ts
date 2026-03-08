export type MetaType = {
  page: number
  num: number
  itemCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  pageCount: number
}
export interface IPaginatedData<T> {
  content: T[]
  meta: MetaType
}

export type PaginateOptionParams = {
  allPage?: boolean
  page?: number
  num?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}
