import { SelectItemValuesProps } from '../components/Selector/Select'

const hourValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const hoursSelectItems: SelectItemValuesProps[] = hourValues.map(
  value => ({
    value,
    label: value.toString(),
  })
)
const minuteValues: number[] = []

for (let i = 0; i < 60; i += 5) {
  minuteValues.push(i)
}

export const minuteSelectItems: SelectItemValuesProps[] = minuteValues.map(
  value => ({
    value,
    label: value.toString(),
  })
)
