import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { Classes } from '../types/classes'

type ClassEditState = {
  currentEditingClassId: number | null
  classEditCache: Record<
    number,
    {
      data: Classes
      isDirty: boolean
    }
  >
  originalClasses: Record<number, Classes>
}
/**
 * Default state for class editing
 * @property {number | null} currentEditingClassId - ID of the class being edited
 * @property {Record<number, { data: Classes }>} classEditCache - Cache of edited class data
 * @property {Record<number, Classes>} originalClasses - Original class data for comparison
 */

const defaultClassEditState: ClassEditState = {
  currentEditingClassId: null,
  classEditCache: {},
  originalClasses: {},
}

export const classEditState = atom<ClassEditState>({
  key: ATOM_KEY.ClassEditState,
  default: defaultClassEditState,
})
