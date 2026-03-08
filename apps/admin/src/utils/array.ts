export const areEqualString2DArrays = (
  arr1: string[][],
  arr2: string[][]
): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].length !== arr2[i].length) {
      return false
    }
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < arr1[i].length; j++) {
      if (arr1[i][j] !== arr2[i][j]) {
        return false
      }
    }
  }

  return true
}

export const noFalsyJoin = (
  data: Array<unknown>,
  separator: string
): string => {
  return data.filter(el => el).join(separator)
}
