export const setResponsiveWidth = (isTablet: boolean, isMobile: boolean): string => {
  if (isTablet) {
    return 'w-[48%]'
  }

  if (isMobile) {
    return 'w-full'
  }
  return 'w-[32%]'
}
