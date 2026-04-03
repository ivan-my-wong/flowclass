export type PackageDiscount = {
  id: number
  createdAt: string
  updatedAt: string
  createdBy: number | null
  updatedBy: number | null
  siteId: number
  institutionId: number
  name: string
  amountPerLesson: number
  isAllClasses: boolean
  applicableClassIds: number[] | null
  isActive: boolean
}

export type CreatePackageDiscountDto = {
  siteId: number
  institutionId: number
  name: string
  amountPerLesson: number
  isAllClasses: boolean
  applicableClassIds: number[] | null
}

export type UpdatePackageDiscountDto = {
  packageDiscountId: number
  patch: Partial<Omit<CreatePackageDiscountDto, 'siteId' | 'institutionId'>>
}
