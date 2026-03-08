export type SimpleApiResponse = {
  errorCode: number
  isSuccess: boolean
  message: string | null
}
export type ApiResponse<T> = {
  data?: T
} & SimpleApiResponse

type ListDataMeta = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  itemCount: number
  num: number
  page: number
  pageCount: number
}

export type ListData<T> = {
  content: T[]
  meta: ListDataMeta
}

// export type MediaUploadResponse = {
//   data: {
//     fileName: string
//     originalName: string
//     mimeType: string
//     size: number
//     url: string
//     id: number
//   }
//   statusCode: number
//   message: string
// }

export type MediaUploadResponse = {
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  id: number
}

export type InstitutionMediaUploadResponse = {
  siteId: number
  institutionId: number
  imageUrl: string
  caption: string
  tags: string
  index: number
  deletedAt: string
  createdAt: string
  updateAt: string
  createdBy: string
  updatedBy: string
  id: number
}

export type InstitutionMediaUploadData = {
  siteId: number
  institutionId: number
  caption: string
  tags: string
  file: File
  index?: number
}

export type InstitutionMediaUpdateData = {
  id: number
  institutionId: number
  caption?: string
  tags?: string
}
