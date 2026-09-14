import dayjs from 'dayjs'
import { countryConfig } from '../src/constants/countryConfig'

export const rootDomain =
  process.env.VITE_E2E_TEST_URL ?? 'http://localhost:5173'

export const testAccount = {
  email: process.env.VITE_E2E_TEST_EMAIL ?? 'crssultontest+1@gmail.com',
  password: process.env.VITE_E2E_TEST_PASSWORD ?? 'Password@123',
}

export const delayTimeout = Number(process.env.VITE_E2E_DELAY_TIMEOUT ?? '3000')
export const timestamp = `${dayjs().format('YYMM')}`
export const detailedTimestamp = `${dayjs().format('YYMMDD HHmmss')}`
export const courseName = `course${timestamp}`
export const className = `class${timestamp}`
export const classPrice = '25000'
export const studentName = `student${timestamp}`
export const studentEmail = `crssultontest+${timestamp}@gmail.com`
export const studentPhone = `852123${timestamp}`
export const anotherStudentName = `1-${studentName}`
export const anotherStudentEmail = `1-${studentEmail}`
export const anotherStudentPhone = `${studentPhone}`

export const fixCoupon = '100'

export const testLogoImage = './src/assets/logos/flowclass.png'
export const testBannerImage =
  './src/assets/loginBanners/register_left_sidebar.png'

export const testDescriptionVideo =
  'https://www.youtube.com/watch?v=Y-V56NlB2ZY'

export enum PlaywrightFieldTypes {
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  NUMBER = 'NUMBER',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  DROPDOWN_LIST = 'DROPDOWN_LIST',
  SWITCH = 'SWITCH',
  PHONE = 'PHONE',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  COUNTRY = 'COUNTRY',
  STEP_SEPARATOR = 'STEP_SEPARATOR',
  IMAGE = 'IMAGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  HEADING = 'HEADING',
  DESCRIPTION = 'DESCRIPTION',
}

// 定義 fieldNames 陣列中每個項目的介面
export interface FieldNameItem {
  name: string
  type: PlaywrightFieldTypes
}

export const fieldNames: FieldNameItem[] = [
  {
    name: `hobby-field-${timestamp}_1`,
    type: PlaywrightFieldTypes.SHORT_ANSWER,
  },
  {
    name: `address-field-${timestamp}_2`,
    type: PlaywrightFieldTypes.SHORT_ANSWER,
  },
]

export const PlaywrightFieldTypesTranslation = {
  SHORT_ANSWER: 'Short Answer',
  PARAGRAPH: 'Paragraph',
  NUMBER: 'Number',
  MULTIPLE_CHOICE: 'Multiple Choice',
  SINGLE_CHOICE: 'Single Choice',
  DROPDOWN_LIST: 'Dropdown List',
  SWITCH: 'Switch',
  PHONE: 'Phone Number',
  DATE: 'Date',
  EMAIL: 'Email',
  COUNTRY: 'Country / Region',
  STEP_SEPARATOR: 'Step Separator',
  IMAGE: 'Image',
  FILE_UPLOAD: 'File Upload',
  HEADING: 'Heading',
  DESCRIPTION: 'Description',
}

const playwrightDefaultFieldTypes = [
  PlaywrightFieldTypes.SHORT_ANSWER,
  PlaywrightFieldTypes.DATE,
  PlaywrightFieldTypes.DROPDOWN_LIST,
  PlaywrightFieldTypes.MULTIPLE_CHOICE,
  PlaywrightFieldTypes.SINGLE_CHOICE,
  PlaywrightFieldTypes.SWITCH,
  PlaywrightFieldTypes.PHONE,
  PlaywrightFieldTypes.EMAIL,
  PlaywrightFieldTypes.COUNTRY,
  PlaywrightFieldTypes.HEADING,
  PlaywrightFieldTypes.DESCRIPTION,
  // PlaywrightFieldTypes.IMAGE,
  // PlaywrightFieldTypes.FILE_UPLOAD,
]

export const playwrightDefaultFieldNames = playwrightDefaultFieldTypes.map(
  (type, idx) => ({
    name: `field${timestamp}_${idx + 1}`,
    type,
  })
)

export const fieldValues = {
  [fieldNames[0].name]: 'Jogging',
  [fieldNames[1].name]: 'Jl. Abu Nawas No. 20, Malang',
}

export const formName = `hobby-form-${timestamp}`

export const createClassTestCase = [
  {
    name: 'undefined-cost-quota',
    cost: undefined,
    quota: undefined,
  },
  {
    name: 'negative',
    cost: '-1',
    quota: '-1',
  },
  {
    name: 'normal',
    cost: '1000',
    quota: '100',
  },
]
export const testPhaseName = 'First Period'
export const testEnrolFormData = {
  name: 'enrol form test',
  description: 'description',
}

export const createSessionData = [
  {
    name: undefined,
    cost: undefined,
    quota: undefined,
  },
  {
    name: 'negative',
    cost: '-1',
    quota: '-1',
  },
  {
    name: 'normal',
    cost: '1000',
    quota: '100',
  },
]

export const createRecurClassData = [
  {
    name: undefined,
    cost: undefined,
    quota: undefined,
    times: undefined,
  },
  {
    name: 'negative',
    cost: '-1',
    quota: '-1',
    times: '-1',
  },
  {
    name: 'normal',
    cost: '1000',
    quota: '100',
    times: '4',
  },
]

export const createRecurClassPriceOptionData = [
  {
    numberOfLessons: 1,
    amount: 100,
    free: false,
  },
  {
    numberOfLessons: 2,
    amount: 200,
    free: false,
  },
  {
    numberOfLessons: 3,
    amount: 240,
    free: false,
  },
  {
    numberOfLessons: 4,
    amount: 500,
    free: false,
  },
]

export const locationRoomNames = Array.from(
  { length: 5 },
  (a, i) => `Test Location Room ${i + 1} - ${timestamp}`
)

export const updatedLocationRoomName = `${locationRoomNames[0]} Updated`

export const testTeacherUser = {
  email:
    process.env.VITE_E2E_TEST_TEACHER_EMAIL ??
    'crssultontest+teacher@gmail.com',
  firstName: process.env.VITE_E2E_TEST_TEACHER_FIRST_NAME ?? 'Crs',
  lastName: process.env.VITE_E2E_TEST_TEACHER_LAST_NAME ?? 'Sulton',
  phone: process.env.VITE_E2E_TEST_TEACHER_PHONE ?? '+85213312341',
  role: 'instructor',
}

export const testWhatsappPhoneNumber =
  process.env.VITE_E2E_TEST_WHATSAPP_PHONE_NUMBER ?? '+17021234567'

export const getCurrencyFromRegionCode = (regionCode: string): string => {
  const country = countryConfig.find(country => country.code === regionCode)
  return country?.currency || ''
}
export const updatedPassword = 'Password12345678'
