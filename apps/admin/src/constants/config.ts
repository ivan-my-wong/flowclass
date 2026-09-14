import { ProviderProps } from '@reactour/tour'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import { theme } from '../styles'

export const config = {
  // time related formats are following: https://day.js.org/docs/en/display/format
  dateFormat: 'YYYY-MM-DD', // zero-padded displayed
  timeFormat: 'HH:mm', // 24-hour display with zero-padded
}

// disable body scroll when tour is open
const disableBody = (target: Element | null) => {
  if (target instanceof HTMLElement) {
    disableBodyScroll(target)
  }
}

const enableBody = (target: Element | null) => {
  if (target instanceof HTMLElement) {
    enableBodyScroll(target)
  }
}

export const tourProviderConfig: Omit<ProviderProps, 'children'> = {
  steps: [],
  afterOpen: disableBody,
  beforeClose: enableBody,
  scrollSmooth: true,
  styles: {
    button: base => ({
      ...base,
      zIndex: 999,
    }),
    arrow: base => ({
      ...base,
      color: theme.colors.text.toString(),
    }),
    close: base => ({
      ...base,
      color: theme.colors.text.toString(),
    }),
    popover: base => ({
      ...base,
      borderRadius: '1rem',
      backgroundColor: theme.colors.background.toString(),
      color: theme.colors.text.toString(),
      padding: '1rem',
    }),
  },
}

export const DEMO_EMAIL = 'demo@flowclass.io'
