type StudentMemos = {
  id?: boolean
  memo?: boolean
  contactEmail?: boolean
  contactPhone?: boolean
  contactName?: boolean
  institutionId?: boolean
}

type User = {
  email?: boolean
  status?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

type Invoices = {
  id?: boolean
  paymentState?: boolean
  proofToken?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}
type Class = {
  id?: boolean
  name?: boolean
  type?: boolean
}

type StudentSchedule = {
  id?: boolean
  invoiceId?: boolean
  class?: Class
}

type Course = {
  id?: boolean
  name?: boolean
}

type EnrollCourses = {
  id?: boolean
  institutionId?: boolean
  registrationForm?: boolean
  invoices?: Invoices
  studentSchedule?: StudentSchedule
  course?: Course
}
type StudentFields = {
  id: boolean
  userId: boolean
  createdAt: boolean
  updatedAt: boolean
  phone: boolean
  name: boolean
  studentMemos?: StudentMemos
  user?: User
  enrollCourses?: EnrollCourses
}
const USER_FIELDS = {
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}

const STUDENT_MEMOS_FIELDS = {
  id: true,
  memo: true,
  contactEmail: true,
  contactPhone: true,
  contactName: true,
  institutionId: true,
}

const COURSE_FIELDS = {
  id: true,
  name: true,
}

const INVOICES_FIELDS = {
  id: true,
  paymentState: true,
  proofToken: true,
  createdAt: true,
  updatedAt: true,
}

const STUDENT_SCHEDULE_FIELDS = {
  id: true,
  invoiceId: true,
  class: {
    id: true,
    name: true,
    type: true,
  },
}
const ENROLL_COURSES_FIELDS = {
  id: true,
  institutionId: true,
  // Excluding registration form data to optimize payload size
  registrationForm: false,
  invoices: INVOICES_FIELDS,
  // Student schedule information
  studentSchedule: STUDENT_SCHEDULE_FIELDS,
  // Course information
  course: COURSE_FIELDS,
}
export const SELECT_STUDENT_FIELDS: StudentFields = {
  // Basic student information
  id: true,
  userId: true,
  phone: true,
  name: true,
  // Timestamps
  createdAt: true,
  updatedAt: true,
  // Associated User information
  user: USER_FIELDS,
  // Student memos
  studentMemos: STUDENT_MEMOS_FIELDS,
  // Enrolled courses information
  enrollCourses: ENROLL_COURSES_FIELDS,
}
