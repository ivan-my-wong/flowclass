export interface DivitWebhookEvent {
  event: {
    eventId: number
    eventDescription: string
  }
  eventData: {
    OrderID: string
    OrderAmount: {
      amount: number
      currency: string
    }
    MerchantRef: string
  }
}
