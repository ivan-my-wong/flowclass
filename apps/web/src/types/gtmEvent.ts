import TagManager, { DataLayerArgs } from 'react-gtm-module'

export enum GtmEvent {
  pageView = 'page_view',
  addShippingInfo = 'add_shipping_info',
  addPaymentInfo = 'add_payment_info',
  beginCheckout = 'begin_checkout',
}

export type GtmItem = {
  item_id: number
  item_name: string
  coupon?: string
  discount?: number
  item_brand: string
  price?: number
  quantity?: number
}

export const setGtmEvent = (
  data: {
    event?: GtmEvent
  } & Record<string, any>
): void => {
  const tagManagerArgs: DataLayerArgs = {
    dataLayer: {
      ...data,
    },
    dataLayerName: 'PageDataLayer',
  }
  TagManager.dataLayer(tagManagerArgs)
}
