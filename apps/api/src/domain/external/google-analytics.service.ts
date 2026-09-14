import { BetaAnalyticsDataClient, protos } from '@google-analytics/data'
import { Injectable } from '@nestjs/common'
import { GoogleAuth } from 'google-auth-library'

import {
  GoogleAnalyticsDataResponse,
  GoogleAnalyticsDataType,
  GoogleAnalyticsRequestParams,
} from '@/application/admin/google-analytics/dto/google-analytics.dto'

@Injectable()
export class GoogleAnalyticsService {
  public analyticsDataClient: BetaAnalyticsDataClient
  private webPropertyId = `properties/${process.env.GA_WEB_PROPERTY}`

  get privateKey() {
    return (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  }

  constructor() {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: this.privateKey,
      },
    })
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      auth: auth as any,
    })
  }

  async getGoogleAnalyticsReport(
    params: GoogleAnalyticsRequestParams
  ): Promise<GoogleAnalyticsDataResponse[]> {
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: this.webPropertyId,
        dateRanges: [
          {
            startDate: params.startDate,
            endDate: params.endDate,
          },
        ],
        ...this.getGoogleAnalyticsParams(params),
      })

      const processData: GoogleAnalyticsDataResponse[] = response.rows.map((row) => {
        const dimensions = row.dimensionValues.map((dimension) => dimension.value)
        const metrics = row.metricValues.map((metric) => metric.value)

        const result = {}

        for (let i = 0; i < response.dimensionHeaders.length; i++) {
          result[response.dimensionHeaders[i].name] = dimensions[i]
        }

        for (let i = 0; i < response.metricHeaders.length; i++) {
          result[response.metricHeaders[i].name] = metrics[i]
        }

        return result as GoogleAnalyticsDataResponse
      })
      return processData
    } catch (e) {
      console.log('GOOGLE_ANALYTICS_ERROR')
    }
  }

  getGoogleAnalyticsParams = (
    params: GoogleAnalyticsRequestParams
  ): protos.google.analytics.data.v1beta.IRunReportRequest => {
    switch (params.dataType) {
      case GoogleAnalyticsDataType.VISITOR_COUNT:
        return {
          dimensions: [
            {
              name: 'date',
            },
          ],
          metrics: [
            {
              name: 'eventCount',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'eventName',
                    stringFilter: {
                      value: 'page_view',
                    },
                  },
                },
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
              ],
            },
          },
          orderBys: [
            {
              dimension: {
                dimensionName: 'date',
              },
              desc: false,
            },
          ],
        }
      case GoogleAnalyticsDataType.VISITOR_COUNTRY:
        return {
          dimensions: [
            {
              name: 'eventName',
            },
            {
              name: 'country',
            },
          ],
          metrics: [
            {
              name: 'activeUsers',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'eventName',
                    stringFilter: {
                      value: 'page_view',
                    },
                  },
                },
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
              ],
            },
          },
        }
      case GoogleAnalyticsDataType.PAGE_COUNT:
        return {
          dimensions: [
            {
              name: 'pagePath',
            },
          ],
          metrics: [
            {
              name: 'eventCount',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'eventName',
                    stringFilter: {
                      value: 'page_view',
                    },
                  },
                },
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
              ],
            },
          },
        }
      case GoogleAnalyticsDataType.COURSE_ENROL:
        return {
          dimensions: [
            {
              name: 'eventName',
            },
            {
              name: 'date',
            },
          ],
          metrics: [
            {
              name: 'eventCount',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'eventName',
                    stringFilter: {
                      value: 'page_view',
                    },
                  },
                },
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
                {
                  filter: {
                    fieldName: 'customEvent:courseId',
                    stringFilter: {
                      value: params.courseId,
                    },
                  },
                },
              ],
            },
          },
        }
      case GoogleAnalyticsDataType.CHANNEL_GROUP:
        return {
          dimensions: [
            {
              name: 'firstUserDefaultChannelGroup',
            },
          ],
          metrics: [
            {
              name: 'activeUsers',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
              ],
            },
          },
        }
      case GoogleAnalyticsDataType.SCHOOL_PURCHASE_REVENUE:
        return {
          dimensions: [
            {
              name: 'date',
            },
            {
              name: 'currencyCode',
            },
          ],
          metrics: [
            {
              name: 'purchaseRevenue',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'customEvent:schoolId',
                    stringFilter: {
                      value: params.institutionId,
                    },
                  },
                },
              ],
            },
          },
        }
      case GoogleAnalyticsDataType.COURSE_PURCHASE_REVENUE:
        return {
          dimensions: [
            {
              name: 'date',
            },
            {
              name: 'currencyCode',
            },
          ],
          metrics: [
            {
              name: 'purchaseRevenue',
            },
          ],
          dimensionFilter: {
            andGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: 'customEvent:courseId',
                    stringFilter: {
                      value: params.courseId,
                    },
                  },
                },
              ],
            },
          },
        }
    }
  }
}
