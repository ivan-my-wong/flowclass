import { test as base } from '@playwright/test'

import {
  anotherStudentEmail,
  anotherStudentName,
  anotherStudentPhone,
  className,
  courseName,
  fieldNames,
  fieldValues,
  fixCoupon,
  studentEmail,
  studentName,
  studentPhone,
  timestamp,
} from './const'
import StudentDetailPage from './pages/student-detail.page'
import StudentFormPage from './pages/student-form.page'
import StudentRemarkPage from './pages/student-remark.page'
import StudentPage from './pages/student.page'
import dayjs from 'dayjs'

const test = base.extend<{
  studentPage: StudentPage
  studentRemarkPage: StudentRemarkPage
  studentDetailPage: StudentDetailPage
  studentFormPage: StudentFormPage
}>({
  studentPage: async ({ page }, use) => {
    await use(new StudentPage(page))
  },
  studentRemarkPage: async ({ page }, use) => {
    await use(new StudentRemarkPage(page))
  },
  studentDetailPage: async ({ page }, use) => {
    await use(new StudentDetailPage(page))
  },
  studentFormPage: async ({ page }, use) => {
    await use(new StudentFormPage(page))
  },
})
test.use({
  storageState: './tests/auth.json',
})
test.describe('Student Creation', () => {
  test('Remove all student', async ({ studentPage }) => {
    await studentPage.removeAllStudent()
  })

  test('Import initial student data from CSV with basic fields', async ({
    studentPage,
  }) => {
    await studentPage.importInitialStudentData()
  })

  test('Add two new columns to the CSV with existing student data', async ({
    studentPage,
  }) => {
    await studentPage.importStudentDataWithNewColumns(fieldNames)
  })

  test('Update custom field with existing student data', async ({
    studentPage,
  }) => {
    await studentPage.importStudentDataWithUpdateCustomField(fieldNames)
  })

  test('New Student created and existing student data should not be updated', async ({
    studentPage,
  }) => {
    await studentPage.importNewStudentWithUpdateExistingStudent(fieldNames)
  })

  test('Import student with exceed max student limit', async ({
    studentPage,
  }) => {
    await studentPage.importStudentWithExceedMaxStudentLimit()
  })

  test('Should Add Student (Basic info only)', async ({ studentPage }) => {
    await studentPage.addStudent({
      studentName,
      studentPhone,
      studentEmail,
    })
  })

  test('Should Add Student (With a course)', async ({ studentPage }) => {
    await studentPage.addStudentWithCourse({
      studentName: anotherStudentName,
      studentPhone: anotherStudentPhone,
      studentEmail: anotherStudentEmail,
      courseName,
      className,
    })
  })
})

test.describe('Student Search', () => {
  test('Should Search Student', async ({ studentPage }) => {
    await studentPage.searchStudent(timestamp)
  })

  // test('Should Search Student with course name', async ({ studentPage }) => {
  //   await studentPage.searchStudentWithCourseName(courseName)
  // })

  test('Should Search Student with class name', async ({ studentPage }) => {
    await studentPage.searchStudentWithClassName(`regular0${className}`)
  })

  test('Should Search Student with status', async ({ studentPage }) => {
    await studentPage.searchStudentWithStatus('Paid')
  })

  test('Should Search Student with custom field', async ({ studentPage }) => {
    await studentPage.searchStudentWithCustomField(
      fieldNames[0].name,
      Object.values(fieldValues)[0]
    )
  })
})

test.describe('Student Remark', () => {
  test('Should be able to add remark', async ({ studentRemarkPage }) => {
    await studentRemarkPage.addOrEditRemark(studentName, 'test')
  })

  test('Should be able to edit remark', async ({ studentRemarkPage }) => {
    await studentRemarkPage.addOrEditRemark(studentName, 'test update')
  })

  test('Should be able to delete remark', async ({ studentRemarkPage }) => {
    await studentRemarkPage.deleteRemark(studentName)
  })
})

test.describe('Detail Student Action', () => {
  test('Should be able to view detail student', async ({
    studentDetailPage,
  }) => {
    await studentDetailPage.viewDetailStudent(studentName)
  })
  test.describe('Should be able to generate application link', () => {
    test('Type regular class', async ({ studentDetailPage }) => {
      await studentDetailPage.generateApplicationLink({
        courseName,
        className: 'regular',
      })
    })
    test('Type workshop class', async ({ studentDetailPage }) => {
      await studentDetailPage.generateApplicationLink({
        courseName,
        className: 'workshop',
      })
    })
    test('Type recurring class', async ({ studentDetailPage }) => {
      await studentDetailPage.generateApplicationLink({
        courseName,
        className: 'recurring',
      })
    })
    test('Type subscription class', async ({ studentDetailPage }) => {
      await studentDetailPage.generateApplicationLink({
        courseName,
        className: 'subscription',
      })
    })
  })
  test('Should be able to assign coupon', async ({ studentDetailPage }) => {
    await studentDetailPage.assignCoupon(fixCoupon)
  })

  test('Should be able to update student alias', async ({
    studentDetailPage,
  }) => {
    await studentDetailPage.updateStudentAlias()
  })
})

test.describe('Assign Course', () => {
  test('Should be able to assign new course', async ({ studentDetailPage }) => {
    await studentDetailPage.assignNewCourse(courseName)
  })

  test('Assign recurring course with price option selected', async ({
    studentDetailPage,
  }) => {
    await studentDetailPage.assignRecurringCourseWithPriceOptionSelected()
  })

  test('Should be able to change class', async ({ studentDetailPage }) => {
    await studentDetailPage.changeClass()
  })

  test('Should be able to add lesson', async ({ studentDetailPage }) => {
    await studentDetailPage.addLesson()
  })

  test('Should be able to change lesson', async ({ studentDetailPage }) => {
    await studentDetailPage.changeLesson()
  })
})

/**
 * Test suite for student course assignation flows including:
 * - Application link generation
 * - Free course enrollment by admin
 * - Paid course enrollment by admin
 */

test.describe('Generate Link and Assign Course', () => {
  test('Link Generator', async ({ studentPage }) => {
    const classTypes = [
      'regular',
      'workshop',
      // 'recurring',
      'subscription',
    ]
    for (const classType of classTypes) {
      await studentPage.generateCourseLink(classType)
    }
  })

  // test('Free Course Assignation' async({}))
  test('Course Free Enrollment by Admin', async ({ studentPage }) => {
    const classTypes = [
      'regular',
      'workshop',
      // 'recurring',
      'subscription',
    ]
    for (const classType of classTypes) {
      await studentPage.assignCourse(true, classType)
    }
  })

  test('Course Paid Enrollment by Admin', async ({ studentPage }) => {
    const classTypes = [
      'regular',
      'workshop',
      //'recurring'
    ]
    for (const classType of classTypes) {
      await studentPage.assignCourse(false, classType)
    }
  })
})

test.describe('Student Form', () => {
  test('Should be able to add enrollment form field', async ({
    studentFormPage,
  }) => {
    await studentFormPage.addEnrollmentFormField()
  })
  test('Should be able to edit enrollment form field', async ({
    studentFormPage,
  }) => {
    await studentFormPage.editEnrollmentFormField()
  })
  test('Should be able to delete enrollment form field', async ({
    studentFormPage,
  }) => {
    await studentFormPage.deleteEnrollmentFormField()
  })
})
