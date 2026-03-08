export const downloadStringAsFile = (data: string, filename: string): void => {
  const a = document.createElement('a')
  a.download = filename
  a.href = data
  a.click()
}

export const downloadStringAsCsvFile = (
  data: string,
  filename: string
): void => {
  if (!data || !filename) {
    throw new Error('Data and filename are required for CSV download')
  }

  const csvHeaders = 'data:text/csv;charset=utf-8,'
  const csvContent = `${csvHeaders}${data}`
  const url = encodeURI(csvContent)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
