type ListDataContent<T> = T[]

type ListDataMeta = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  itemCount: number
  num: number
  page: number
  pageCount: number
}

export type ListData<T> = {
  content: ListDataContent<T>
  meta: ListDataMeta
}

export type LongDescription = {
  sectionTitle: string
  content: string
}

export type AddressDetail = {
  country: string
  city: string
  state: string
  area: string
  addressLine1: string
  addressLine2: string
}

export type ImageDetail = {
  id: number
  siteId: number
  institutionId: number
  // name: string
  caption: string
  tags: string
  // description: string
  imageUrl: string
}

export type MediaUploadResponse = {
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  id: number
}

export type BaseApiResponse = {
  createdAt: string
  createdBy: number
  updatedAt: string
  updatedBy: number
  deletedAt?: string
}
