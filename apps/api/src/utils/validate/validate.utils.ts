export const validateDomain = (s?: string): boolean => {
  if (s) {
    const validDomain = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    const validSubdomain =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.staging)?(\.flowclass\.io|\.course\.site|\.flowclass\.site|\.educator\.site)$/

    const healthCheckDomain = /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/

    return validDomain.test(s) || validSubdomain.test(s) || healthCheckDomain.test(s)
  } else {
    return false
  }
}

export const isFlowclassDomain = (s?: string): boolean => {
  if (s) {
    const validSubdomain =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.staging)?(\.flowclass\.io|\.course\.site|\.flowclass\.site|\.educator\.site)$/

    return validSubdomain.test(s)
  } else {
    return false
  }
}

export const isIsoDate = (str): boolean => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
  const d = new Date(str)
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str // valid date
}
