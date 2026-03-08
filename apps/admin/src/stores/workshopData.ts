import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'

// for any fields, will defined later

export type Workshop = {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  createdBy: string | null
  updatedBy: string | null
  siteId: number
  institutionId: number
  name: string | null
  type: string
  shortDescription: string | null
  longDescriptions: string | null
  faq: string | null
  onlineBooking: boolean
  registrationMes: string | null
  enableSpecialStudy: boolean
  specialStudy: string | null
  enableSchoolName: boolean
  schoolNameField: string | null
  customFields: any[] | null
  previewImageName: string | null
  previewImageUrl: string | null
  previewVideoName: string | null
  previewVideoUrl: string | null
  favoriteCount: number
  viewLimit: number
  viewCount: number
  published: boolean
  rating: number
  totalRating: number
  totalRater: number
  commentCount: number
  displayId: string | null
  recruitStart: string | null
  recruitEnd: string | null
  __sessions__: any[]
}

type WorkshopState = {
  workshops: Workshop[]
  currentWorkshop: Workshop | null
  initFetch: boolean
}

const defaultWorkshopState: WorkshopState = {
  workshops: [],
  currentWorkshop: null,
  initFetch: false,
}

export const workshopState = atom<WorkshopState>({
  key: ATOM_KEY.WorkshopState,
  default: defaultWorkshopState,
})
