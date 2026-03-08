import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { NotificationsSettingProps } from '../types/notifications'

import { persistLocalStorage } from './utils/recoilPersist'

type NotificationSettingState = {
  currentSetting: NotificationsSettingProps | null
  initFetch: boolean
}

const defaultNotificationSettingState: NotificationSettingState = {
  currentSetting: null,
  initFetch: false,
}

const notificationSettingState = atom<NotificationSettingState>({
  key: ATOM_KEY.NotificationSettingState,
  default: defaultNotificationSettingState,
  effects: [persistLocalStorage],
})

export default notificationSettingState
