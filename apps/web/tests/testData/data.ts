import moment from 'moment'

export const testUrl = process.env.NEXT_PUBLIC_E2E_TEST_URL || 'http://localhost:4000'
export const autoFillFeatureFlag = process.env.NEXT_PUBLIC_AUTO_FILL_FEATURE_FLAG === 'true'
export const timestamp = `${moment().format('YYMMDD')}`
export const courseName = `course${timestamp}`
export const className = `class${timestamp}`
export const classPrice = '25000'
export const trialLessonPrice = '0'
export const studentName = `student${timestamp}`
export const studentEmail = `crssultontest+${studentName}@gmail.com`
export const studentPhone = `852121${timestamp}`
export const studentName2 = `student${timestamp}2`
export const studentEmail2 = `crssultontest+${studentName2}@gmail.com`
export const studentPhone2 = `852122${timestamp}`
export const fixCoupon = '100'
export const fixCouponCode = 'FIXED'
export const largestFixedCouponCode = 'FIXEDLG'
export const largestFixedCoupon = '100000'

export const classTag = `tag-${timestamp}`

export const currency = 'IDR Rp'

export const linkSocialMedia = 'https://www.instagram.com/'

export const createRecurClassPriceOptionData = [
  {
    numberOfLessons: 1,
    amount: Number(classPrice) / 5,
    free: false,
  },
  {
    numberOfLessons: 2,
    amount: (Number(classPrice) / 5) * 2,
    free: false,
  },
  {
    numberOfLessons: 3,
    amount: Number(classPrice),
    free: false,
  },
  {
    numberOfLessons: 4,
    amount: Number(classPrice) * 2,
    free: false,
  },
]
