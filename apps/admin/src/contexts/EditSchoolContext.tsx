import { createContext, Dispatch } from 'react'

import { ActionTypes, initialState } from '@/reducers/edit-school.reducers'

const EditSchoolContext = createContext([initialState, () => {}] as [
  typeof initialState,
  Dispatch<ActionTypes>
])

export default EditSchoolContext
