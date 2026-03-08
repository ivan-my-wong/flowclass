import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'
import { SchoolWebpageSettings, SiteSettings } from '@/types'

type SettingsStateType = {
  siteSettings: Partial<SiteSettings>
  schoolSettings: Partial<SchoolWebpageSettings>
}

const defaultSiteSettingsState: Partial<SiteSettings> = {}

const defaultSchoolSettingsState: Partial<SchoolWebpageSettings> = {}

export const SettingsState = atom<SettingsStateType>({
  key: ATOM_KEY.settings,
  default: {
    siteSettings: defaultSiteSettingsState,
    schoolSettings: defaultSchoolSettingsState,
  },
})
