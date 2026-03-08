export const inRange = (x: number, min: number, max: number): boolean => {
  return (x - min) * (x - max) <= 0
}

export const getStaffPlanKey = (count: number): string => {
  if (inRange(count, 1, 3)) return 'MULTIPLE_ADMIN_1'
  if (inRange(count, 4, 10)) return 'MULTIPLE_ADMIN_4'
  if (inRange(count, 11, 20)) return 'MULTIPLE_ADMIN_20'
  if (inRange(count, 21, 30)) return 'MULTIPLE_ADMIN_30'
  if (count > 30) return 'MULTIPLE_ADMIN_UNLIMITED'
  return ''
}
