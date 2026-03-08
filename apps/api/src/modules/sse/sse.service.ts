import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { fromEvent } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class SSEService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitEvent(eventName: string, data: any) {
    this.eventEmitter.emit(eventName, data)
  }

  getEvent(eventName: string) {
    if (!eventName) return
    return fromEvent(this.eventEmitter, eventName).pipe(
      map((data) => ({ data: JSON.stringify(data) }))
    )
  }
}
