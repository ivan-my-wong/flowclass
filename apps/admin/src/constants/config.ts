import { ProviderProps } from '@reactour/tour'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

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
      color: 'var(--color-text)',
    }),
    close: base => ({
      ...base,
      color: 'var(--color-text)',
    }),
    popover: base => ({
      ...base,
      borderRadius: '1rem',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)',
      padding: '1rem',
    }),
  },
}

export const DEMO_EMAIL = 'demo@flowclass.io'
