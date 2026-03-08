export type BlockTime = {
  id: number
  startTime: Date
  endTime: Date
  wholeDay: boolean
}

export type CreateBlockTimeProps = {
  institutionId: number
  startTime: Date
  endTime: Date
  wholeDay: boolean
}
