import { ActionTypeLessonWts } from '@/common/constants/automationFlow'

export const GlobalWhatsappContentSID: Record<ActionTypeLessonWts, string> = {
  [ActionTypeLessonWts.CHANGE_LESSON]: 'HXe15ef19829d9c5d034e8be0268c73492',
  [ActionTypeLessonWts.ADD_LESSON]: 'HXa976d8d784c39743f83f4a238bb0d0a7',
  // We need to create new default template at twilio
  [ActionTypeLessonWts.ADD_CLASS]: 'HXf2e628a5440b7b431328da65fe362790',
}
