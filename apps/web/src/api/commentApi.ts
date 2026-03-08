import { ListData } from '@/types/api'
import { CourseComment } from '@/types/comment'

import customFetch from './baseClient'

export const getSchoolComments = async (schoolId: number): Promise<ListData<CourseComment>> => {
  const { data: listData } = await customFetch<ListData<CourseComment>>('/admin/comments', {
    method: 'GET',
    query: { institutionId: schoolId.toString() },
  })
  return listData
}
