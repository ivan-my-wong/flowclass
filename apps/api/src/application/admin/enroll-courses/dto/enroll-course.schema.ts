import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { EnrolledClassCountDTO } from '@/application/admin/enroll-courses/dto/enrollmentRecord.dto'
import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import {
  PayNowResponse,
  StudentEnrollCoursePricingInfo,
  StudentEnrollCourseResponse,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'

export const createEnrollDoc = `For Regular course: \`\`\`meta.classId, meta.periodId, meta.pickedFirstDate\`\`\` is required
\n\`meta.pickedFirstDate\` is in UTC timezone
\nFor Workshop: \`\`\`meta.sessionId\`\`\` is required
\nFor Appointment: \`\`\`meta.appointmentSchedule\`\`\` is required
\n
\nNote: TimeZone in \`\`\`appointmentSchedule\`\`\` is \`\`\`LOCAL\`\`\` time zone, with format look like: \`\`\`YYYY-MM-DDThh:mm:ss.aaa+08:00\`\`\` (GMT+8)
\nThe "LOCAL" timezone is following setting of the site (__NOT__ depends on browser's timezone)
\n---
__specialStudy__: the key name and value's data type in this json can vary depends on setting of \`specialStudy\` in enrollment section of the Course/Appointment/Workshop creation.
\n which specific in this api: \`/admin/courses/enrollment\`
\n And it could be null if \`enableSpecialStudy\` was set to \`false\`
\n__schoolName__ Field: similar to __specialStudy__ it can be an __JSON__ or __null__
\n---
\n \nThe key and value inside \`\`\`registrationForm\`\`\` is vary depends on the custom field of the corresponding course
`

export const createEnrollCourseSchema: SchemaObject = {
  properties: {
    data: {
      oneOf: [
        {
          $ref: getSchemaPath(StudentEnrollCourseResponse),
        },
        {
          $ref: getSchemaPath(PayNowResponse),
        },
        {
          type: 'array',
          items: {
            oneOf: [
              {
                $ref: getSchemaPath(PayNowResponse),
              },
              {
                $ref: getSchemaPath(StudentEnrollCourseResponse),
              },
            ],
          },
        },
      ],
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}

export const reCreateClientSecretSchema: SchemaObject = {
  properties: {
    data: {
      type: 'string',
      example: 'eyjkksdlsiiwksadlkad',
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}

export const getAllEnrollCourseSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(StudentEnrollCourseResponse),
          },
        },
        meta: {
          $ref: getSchemaPath(PageMetaDto),
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const studentCoursesEnrolledSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(StudentEnrollCourseResponse),
          },
        },
        meta: {
          $ref: getSchemaPath(PageMetaDto),
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const confirmStateEnrollCourseSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StudentEnrollCourseResponse),
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}

export const confirmEnrollCourseSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StudentEnrollCoursePricingInfo),
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}

export const studentNotificationSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(StudentNotificationSettings),
      },
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}

export const classEnrolledCountSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(EnrolledClassCountDTO),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}
