export const calculateMulberryHouseRates = ({
  timePeriod,
  pickNumber,
}: {
  timePeriod: number
  pickNumber: number
}) => {
  if (timePeriod === 60) {
    if (pickNumber === 1) {
      return 0
    }
    if (pickNumber === 2) {
      return 55
    }
    if (pickNumber === 3 || pickNumber === 4) {
      return 85
    }
    if (pickNumber > 4) {
      return 125
    }
  } else if (timePeriod === 90) {
    if (pickNumber === 1) {
      return 0
    }
    if (pickNumber === 2) {
      return 55
    }
    if (pickNumber === 3 || pickNumber === 4) {
      return 110
    }
    if (pickNumber > 4) {
      return 165
    }
  }
}
