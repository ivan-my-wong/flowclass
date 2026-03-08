import { BsFillCalendarCheckFill, BsGrid1X2Fill } from 'react-icons/bs'
import { FaUserClock } from 'react-icons/fa'

import { ClassType } from '@/types'

export const courseDescription = [
  {
    type: 'regular',
    icon: BsGrid1X2Fill,
    paragraph: ['regularDescription1', 'regularDescription2', 'regularDescription3'],
  },
  {
    type: 'appointment',
    icon: FaUserClock,
    paragraph: ['appointmentDescription1', 'appointmentDescription2', 'appointmentDescription3'],
  },

  {
    type: 'workshop',
    icon: BsFillCalendarCheckFill,
    paragraph: ['workshopDescription1', 'workshopDescription2', 'workshopDescription3'],
  },

  {
    type: 'recurring',
    icon: FaUserClock,
    paragraph: ['appointmentDescription1', 'appointmentDescription2', 'appointmentDescription3'],
  },
  {
    type: 'regularV2',
    icon: BsGrid1X2Fill,
    paragraph: ['regularDescription1', 'regularDescription2', 'regularDescription3'],
  },
]

export const applicationDescription: Record<string, Record<string, string>> = {
  selectOption: {
    [ClassType.regular]: 'enrol:stepTitles.selectOption.normal',
    [ClassType.subscription]: 'enrol:stepTitles.selectOption.normal',
    [ClassType.workshop]: 'enrol:stepTitles.selectOption.event',
    [ClassType.recurring]: 'enrol:stepTitles.selectOption.normal',
    [ClassType.regularV2]: 'enrol:stepTitles.selectOption.normal',
  },
  selectDate: {
    [ClassType.regular]: 'enrol:pickPeriodStep.selectTimeSlot.normal',
    [ClassType.subscription]: 'enrol:pickPeriodStep.selectTimeSlot.normal',
    [ClassType.workshop]: 'enrol:pickPeriodStep.selectTimeSlot.event',
    [ClassType.recurring]: 'enrol:pickPeriodStep.selectTimeSlot.recurring',
    [ClassType.regularV2]: 'enrol:pickPeriodStep.selectTimeSlot.normal',
  },
  customField: {
    [ClassType.workshop]: 'enrol:customFieldStep.title.event',
    [ClassType.recurring]: 'enrol:customFieldStep.title.normal',
    [ClassType.subscription]: 'enrol:customFieldStep.title.normal',
    [ClassType.regular]: 'enrol:customFieldStep.title.normal',
    [ClassType.regularV2]: 'enrol:customFieldStep.title.normal',
  },
}

export const courseApplicationSteps = {
  [ClassType.regular]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.workshop]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.recurring]: [
    'enrol:stepTitles.stepIndicator.selectRecurPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],

  [ClassType.subscription]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.appointment]: [
    'enrol:stepTitles.stepIndicator.selectRecurPeriod',
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.regularV2]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
}

export const courseApplicationStepsWishlist = {
  [ClassType.regular]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.workshop]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.recurring]: [
    'enrol:stepTitles.stepIndicator.selectRecurPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],

  [ClassType.subscription]: ['enrol:stepTitles.stepIndicator.confirmDetail'],
  [ClassType.appointment]: [
    'enrol:stepTitles.stepIndicator.selectRecurPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.regularV2]: [
    'enrol:stepTitles.stepIndicator.selectPeriod',
    'enrol:stepTitles.stepIndicator.selectTuition',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
}

export const courseApplicationStepsApplyFromWishlist = {
  [ClassType.regular]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.workshop]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.recurring]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],

  [ClassType.subscription]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],

  [ClassType.appointment]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
  [ClassType.regularV2]: [
    'enrol:stepTitles.stepIndicator.customField',
    'enrol:stepTitles.stepIndicator.confirmDetail',
  ],
}
