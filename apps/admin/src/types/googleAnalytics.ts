export enum GoogleAnalyticsDataType {
  VISITOR_COUNT = 'visitorCount',
  VISITOR_COUNTRY = 'visitorCountry',
  PAGE_COUNT = 'pageCount',
  COURSE_ENROL = 'courseEnrol',
  CHANNEL_GROUP = 'channelGroup',
  SCHOOL_PURCHASE_REVENUE = 'schoolPurchaseRevenue',
  COURSE_PURCHASE_REVENUE = 'coursePurchaseRevenue',
}

export type VisitorCountData = {
  date: string
  eventCount: string
}

export type VisitorCountryData = {
  country: string
  activeUsers: string
}

export type PageCountData = {
  pagePath: string
  eventCount: string
}

export type ChannelGroupData = {
  firstUserDefaultChannelGroup: string
  activeUsers: string
}

export type SchoolPurchaseRevenueData = {
  date: string
  currencyCode: string
  purchaseRevenue: string
}

export type GoogleAnalyticsDataResponse =
  | VisitorCountData[]
  | VisitorCountryData[]
  | PageCountData[]
  | ChannelGroupData[]
  | SchoolPurchaseRevenueData[]

export type GoogleAnalyticsBodyParams = {
  startDate: string
  endDate: string
  dataType: GoogleAnalyticsDataType
  institutionId: number
  courseId?: number
}
