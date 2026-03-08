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

/** No-op: GTM/analytics disabled in OSS mode */
export const setGtmEvent = (
  _data: {
    event?: GtmEvent
  } & Record<string, unknown>
): void => {}
