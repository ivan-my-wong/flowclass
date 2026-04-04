// Default quick-select options shown in the student-lesson remarks modal.
// Edit the `label` values to customise the displayed text.
// Edit the `value` values to customise the text saved to the database.

export type LessonRemarkPreset = {
  label: string
  value: string
}

export const LESSON_REMARK_PRESETS: LessonRemarkPreset[] = [
  {
    label: 'Skip next month',
    value: 'Skip next month',
  },
  {
    label: 'Change from Zoom to Video next month',
    value: 'Change from Zoom to Video next month',
  },
  {
    label: 'Change from Video to Zoom next month',
    value: 'Change from Video to Zoom next month',
  },
]
