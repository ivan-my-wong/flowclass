import { atom } from 'recoil'

import { MetaType } from '@/types/pagination'
import { WhatsappTemplate } from '@/types/whatsappTemplate'

import { ATOM_KEY } from '../constants/atomKey'

import { persistLocalStorage } from './utils/recoilPersist'

type WhatsappTemplateState = {
  whatsappTemplates: WhatsappTemplate[]
  whatsappTemplate: WhatsappTemplate | null
  meta?: MetaType | null
}

const defaultPayoutState: WhatsappTemplateState = {
  whatsappTemplates: [],
  whatsappTemplate: null,
  meta: null,
}

export default atom<WhatsappTemplateState>({
  key: ATOM_KEY.WhatsappTemplate,
  default: defaultPayoutState,
  effects: [persistLocalStorage],
})
