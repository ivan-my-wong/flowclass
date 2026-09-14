export const getS3FileUrl = (key: string | undefined) => {
  if (!key) return ''
  return `https://s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}/${key}`
}

export const rearrangeOrder = <T extends { id: number }>(data: T[], order: number[]): T[] => {
  if (!data || !order || order.length <= 1) return data

  const sortedData = [...data].sort((a, b) => {
    const aIndex = order.indexOf(a.id)
    const bIndex = order.indexOf(b.id)
    if (aIndex === -1) {
      return 1
    }
    if (bIndex === -1) {
      return -1
    }
    return aIndex - bIndex
  })
  return sortedData
}
