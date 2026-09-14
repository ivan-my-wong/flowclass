import { AutomationFunction } from '@/types/automationFlow'

export const getAutomationFunctions = async (): Promise<
  AutomationFunction[]
> => {
  return [
    {
      id: 1,
      name: 'Create Invoice',
      functionName: 'createInvoice',
      description:
        'Create invoice for students who have not paid for their courses',
      variables: [
        '{{studentName}}',
        '{{uploadPaymentUrl}}',
        '{{courseName}}',
        '{{className}}',
        '{{institutionName}}',
      ],
    },
    {
      id: 2,
      name: 'Send Payment Reminder',
      functionName: 'sendPaymentReminder',
      description:
        'Send payment reminder to students who have not paid for their courses',
      variables: [
        '{{studentName}}',
        '{{uploadPaymentUrl}}',
        '{{institutionName}}',
      ],
    },
    {
      id: 3,
      name: 'Send Course Reminder',
      functionName: 'sendCourseReminder',
      description:
        'Send course reminder to students who have not completed their courses',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
      ],
    },
    {
      id: 4,
      name: 'Send Change Schedule Lesson',
      functionName: 'sendChangeScheduleLesson',
      description: 'Send change schedule lesson reminder to students',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{classLessonDate}}',
        '{{newClassLessonDate}}',
        '{{location}}',
        '{{adminPhone}}',
      ],
    },
    {
      id: 5,
      name: 'Send Upload Payment Receipt',
      functionName: 'sendUploadPaymentReceipt',
      description: 'Send whatsapp for upload payment receipt',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{location}}',
        '{{adminPhone}}',
        '{{uploadPaymentUrl}}',
      ],
    },
    {
      id: 6,
      name: 'Send Reminder After Student Finish Application',
      functionName: 'sendAfterFinishApplication',
      description:
        'Send whatsapp for reminding the student after finish the application form',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{location}}',
        '{{adminPhone}}',
        '{{uploadPaymentUrl}}',
      ],
    },
    {
      id: 7,
      name: 'Send Reminder After Admin Approve',
      functionName: 'sendAfterApprovePayment',
      description:
        'Send whatsapp for reminding the student after admin approved the payment',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{location}}',
        '{{adminPhone}}',
        '{{successPaymentLink}}',
      ],
    },
    {
      id: 8,
      name: 'Send Reminder After Add New Class',
      functionName: 'sendAddClassReminder',
      description: 'Send for reminding the student after admin add new class',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{location}}',
        '{{adminPhone}}',
        '{{successPaymentLink}}',
      ],
    },
    {
      id: 9,
      name: 'Send Reminder After Add New Lesson',
      functionName: 'sendAddLessonReminder',
      description: 'Send for reminding the student after admin add new lesson',
      variables: [
        '{{studentName}}',
        '{{institutionName}}',
        '{{className}}',
        '{{courseName}}',
        '{{location}}',
        '{{adminPhone}}',
        '{{successPaymentLink}}',
      ],
    },
  ]
}
