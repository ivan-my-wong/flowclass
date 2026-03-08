export const trimMetaData = (data: any) => {
  delete data.createdAt
  delete data.updatedAt
  delete data.updatedBy
  delete data.createdBy
  delete data.deletedAt
  return data
}

export const trimAllExcept = (excludeKeys: string[], data: any) => {
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (excludeKeys.indexOf(key) !== -1) {
      continue
    }
    delete data[key]
  }
  return data
}

export const sortByCriterias = (
  parent: any,
  childKey: string,
  order: string,
  criteria1: string,
  criteria2: string | null = null,
  dataType: string | null = null
) => {
  const dataSource = parent[childKey]
  if (!dataSource || !(dataSource instanceof Array) || dataSource.length === 1) return
  // sort cr1
  for (let i = 0; i < dataSource.length; i++) {
    for (let j = 0; j < dataSource.length - i - 1; j++) {
      const el1 = dataSource[j]
      const el2 = dataSource[j + 1]
      let condition = false
      if (dataType === 'date') {
        condition =
          order === 'ASC'
            ? new Date(el1[criteria1]) > new Date(el2[criteria1])
            : new Date(el1[criteria1]) < new Date(el2[criteria1])
      } else {
        condition =
          order === 'ASC' ? el1[criteria1] > el2[criteria1] : el1[criteria1] < el2[criteria1]
      }
      if (condition) {
        const tmp = dataSource[j]
        dataSource[j] = dataSource[j + 1]
        dataSource[j + 1] = tmp
      }
    }
  }
  if (!criteria2) {
    parent[childKey] = dataSource
    return
  }
  // group for sorting criteria2
  const groups = dataSource.reduce((acc, curr) => {
    if (acc.length === 0 || curr[criteria1] !== acc[acc.length - 1][0][criteria1]) {
      acc.push([curr])
    } else {
      acc[acc.length - 1].push(curr)
    }
    return acc
  }, [])
  groups.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = 0; j < group.length - i - 1; j++) {
        const el1 = group[j]
        const el2 = group[j + 1]
        const condition =
          order === 'ASC' ? el1[criteria2] > el2[criteria2] : el1[criteria2] < el2[criteria2]
        if (condition) {
          const tmp = group[j]
          group[j] = group[j + 1]
          group[j + 1] = tmp
        }
      }
    }
  })
  let result = []
  for (let i = 0; i < groups.length; i++) {
    const gr = groups[i]
    result = result.concat(gr)
  }
  parent[childKey] = result
}

export const toCamelCase = (obj: any, replace?: string[], ignoreKey?: string) => {
  const converted = {}
  Object.keys(obj).forEach((snakeCasedKey) => {
    if (ignoreKey !== snakeCasedKey) {
      let key = snakeCasedKey
      if (replace) {
        replace.forEach((element) => {
          key = key.replace(element, '')
        })
      }
      const cm = key.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())

      converted[cm] = obj[snakeCasedKey]
    }
  })

  return converted
}
