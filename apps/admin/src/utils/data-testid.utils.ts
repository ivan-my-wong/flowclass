export const generateDataTestId = (prefix: string, key: string): string => {
  return `${prefix}-${key?.toLowerCase().replaceAll(' ', '-')}`
}
