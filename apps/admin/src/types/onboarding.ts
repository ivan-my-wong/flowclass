export enum QuizStep {
  SCHEDULE = 'schedule',
  ENROLLMENT = 'enrollment',
  RESULTS = 'results',
  COURSE_DETAILS = 'courseDetails',
  TIME_SLOTS = 'timeSlots',
  PREVIEW = 'preview',
}

export enum ScheduleAnswer {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  OTHER = 'other',
}

export enum EnrollmentAnswer {
  SAME_END = 'same-end',
  DIFFERENT_END = 'different-end',
  OTHER = 'other',
}
