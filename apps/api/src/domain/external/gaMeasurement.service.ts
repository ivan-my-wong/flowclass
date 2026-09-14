import { Injectable } from '@nestjs/common'
import fetch from 'node-fetch'

import { GaMeasurementRequestDto } from './dto/gaMeasurement.dto'

@Injectable()
export class GaMeasurementService {
  private isProdEnv = process.env.APP_ENV === 'production'
  private gaMeasurementUrl = `${process.env.GA_MEASUREMENT_API_KEY}${
    this.isProdEnv ? '' : '/staging'
  }`
  private gaWebMeasurementUrl = `${process.env.GA_MEASUREMENT_API_KEY}${
    // this.isProdEnv ? '/web' : '/web-staging'
    this.isProdEnv ? '/web' : '/web-staging'
  }`

  async sendToGa(dto: GaMeasurementRequestDto) {
    // Without CID, the client will not be tracked
    if (this.gaMeasurementUrl && this.gaMeasurementUrl !== null) {
      const response = await fetch(`${this.gaMeasurementUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: dto.clientId,
          userId: dto.userId ?? undefined,
          events: dto.events,
          user_properties: dto.userProperties ?? undefined,
        }),
      })

      return response
    }
  }

  async sendToWebGa(dto: GaMeasurementRequestDto) {
    // Without CID, the client will not be tracked
    if (this.gaWebMeasurementUrl && this.gaWebMeasurementUrl !== null) {
      const response = await fetch(`${this.gaWebMeasurementUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: dto.clientId,
          userId: dto.userId ?? undefined,
          events: dto.events,
          user_properties: dto.userProperties ?? undefined,
        }),
      }).catch((error) => console.log(error))

      return response
    }
  }
}
