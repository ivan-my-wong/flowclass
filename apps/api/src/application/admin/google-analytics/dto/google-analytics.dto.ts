import { IsEnum, IsString, Matches, ValidateIf } from 'class-validator'

export enum GoogleAnalyticsDataType {
  VISITOR_COUNT = 'visitorCount',
  VISITOR_COUNTRY = 'visitorCountry',
  PAGE_COUNT = 'pageCount',
  COURSE_ENROL = 'courseEnrol',
  CHANNEL_GROUP = 'channelGroup',
  SCHOOL_PURCHASE_REVENUE = 'schoolPurchaseRevenue',
  COURSE_PURCHASE_REVENUE = 'coursePurchaseRevenue',
}

export class GoogleAnalyticsRequestParams {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be a string in the format YYYY-MM-DD',
  })
  startDate: string

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be a string in the format YYYY-MM-DD',
  })
  endDate: string

  @IsEnum(GoogleAnalyticsDataType)
  dataType: GoogleAnalyticsDataType

  @IsString()
  institutionId: string

  @IsString()
  @ValidateIf((o) => {
    const validTypes = [
      GoogleAnalyticsDataType.COURSE_ENROL,
      GoogleAnalyticsDataType.COURSE_PURCHASE_REVENUE,
    ]
    return validTypes.includes(o.dataType)
  })
  courseId?: string
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
  | VisitorCountData
  | VisitorCountryData
  | PageCountData
  | ChannelGroupData
  | SchoolPurchaseRevenueData
