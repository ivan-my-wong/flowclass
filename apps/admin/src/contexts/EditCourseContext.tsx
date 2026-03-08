import { createContext, Dispatch } from 'react'

import { ActionTypes, initialState } from '@/reducers/edit-course.reducers'

const EditCourseContext = createContext([initialState, () => {}] as [
  typeof initialState,
  Dispatch<ActionTypes>
])

export default EditCourseContext
