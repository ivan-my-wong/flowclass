export const validateCron = (cron: string) =>
  !!cron && /^(\*|[\d,-]+)(\s(\*|[\d,-]+)){4}$/.test(cron)
