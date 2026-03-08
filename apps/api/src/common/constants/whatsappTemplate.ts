export enum ActionTypeLessonWts {
  CHANGE_LESSON = 'CHANGE_LESSON',
  ADD_LESSON = 'ADD_LESSON',
  ADD_CLASS = 'ADD_CLASS',
}

export enum AutomationFunctionNames {
  SEND_ADD_CLASS_REMINDER = 'SEND_ADD_CLASS_REMINDER',
  SEND_ADD_LESSON_REMINDER = 'SEND_ADD_LESSON_REMINDER',
  SEND_CHANGE_SCHEDULE_LESSON = 'SEND_CHANGE_SCHEDULE_LESSON',
}

export const GlobalWhatsappContentSID: Record<ActionTypeLessonWts, string> = {
  [ActionTypeLessonWts.CHANGE_LESSON]: 'HXe15ef19829d9c5d034e8be0268c73492',
  [ActionTypeLessonWts.ADD_LESSON]: 'HXa976d8d784c39743f83f4a238bb0d0a7',
  // Legacy default template content IDs
  [ActionTypeLessonWts.ADD_CLASS]: 'HXf2e628a5440b7b431328da65fe362790',
}
