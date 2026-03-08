import { ISO_8601_REGEX } from '@/common/constants'

export class LessonString extends String {
  private time1: string
  private time2: string

  constructor(timeString: string) {
    super(timeString)
    const [time1, time2] = timeString.split(' ')

    if (!LessonString.isValidISO8601(time1) || !LessonString.isValidISO8601(time2)) {
      throw new Error('Invalid lesson string format')
    }

    this.time1 = time1
    this.time2 = time2
  }

  static isValidISO8601(timeString: string): boolean {
    return ISO_8601_REGEX.test(timeString)
  }

  getTime1(): string {
    return this.time1
  }

  getTime2(): string {
    return this.time2
  }

  toString(): string {
    return `${this.time1} ${this.time2}`
  }

  getStartDate(): Date {
    return new Date(this.time1)
  }

  getEndDate(): Date {
    return new Date(this.time2)
  }

  /**
   * @returns YYYY-MM-DD string of start date
   */
  getStartDateString(): string {
    return this.time1.split('T')[0]
  }

  isBefore(t1: LessonString) {
    return t1.getStartDate().getTime() < this.getStartDate().getTime()
  }

  isInTheFuture() {
    const now = new Date()
    const startTime = this.getStartDate()
    return now < startTime
  }
}
