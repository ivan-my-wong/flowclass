// schema for Swagger output example

import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { baseProperties } from '@/models/schemas/base.schema'

// Response Schema
export const schema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'numer',
          example: 2,
        },
        siteId: {
          type: 'number',
          example: 3,
        },
        institutionId: {
          type: 'number',
          example: 4,
        },
        name: {
          type: 'string',
          example: 'Course Name',
        },
        type: {
          type: 'string',
          example: 'appointment',
        },
        seoContent: {
          type: 'object',
          properties: {
            metaTitle: {
              type: 'string',
              example: 'Name of school',
            },
            metaDescription: {
              type: 'string',
              example: 'input_text',
            },
          },
        },
        longDescriptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sectionTitle: {
                type: 'string',
                example: 'This is description section title',
              },
              content: {
                type: 'string',
                example: 'This is description content',
              },
            },
          },
        },
        faq: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                example: 'This is an question',
              },
              answer: {
                type: 'string',
                example: 'This is an answer',
              },
            },
          },
        },
        onlineBooking: {
          type: 'boolean',
          example: true,
        },
        registrationMes: {
          type: 'string',
          example: 'Congratulations, you have successfully registered for the course',
        },

        schoolNameField: {
          type: 'object',
          properties: {
            fieldName: {
              type: 'string',
              example: 'Name of school',
            },
            inputType: {
              type: 'string',
              example: 'input_text',
            },
            description: {
              type: 'string',
              example: 'What is your current shool name?',
            },
            validation: {
              type: 'string',
              example: 'not_empty',
            },
            fieldData: {
              type: 'array',
              items: {
                oneOf: [],
              },
            },
          },
        },
        customFields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fieldName: {
                type: 'string',
                example: 'label',
              },
              inputType: {
                type: 'string',
                example: 'radio_group',
              },
              description: {
                type: 'string',
                example: 'Please input something below',
              },
              validation: {
                type: 'string',
                example: 'not_empty',
              },
              fieldData: {
                type: 'array',
                items: {
                  oneOf: [
                    {
                      type: 'string',
                      example: 'Options 1',
                    },
                    {
                      type: 'string',
                      example: 'Options 2',
                    },
                    {
                      type: 'string',
                      example: 'Options 3',
                    },
                  ],
                },
              },
            },
          },
        },
        previewImageName: {
          type: 'string',
          example: 'shiusyfaosf.jpg',
        },
        previewImageUrl: {
          type: 'string',
          example: 'https://imageserver.com/file/shiusyfaosf.jpg',
        },
        previewVideoName: {
          type: 'string',
          example: 'shiusyfaosf.mp4',
        },
        previewVideoUrl: {
          type: 'string',
          example: 'https://videoserver.com/file/shiusyfaosf.mp4',
        },
        favouriteCount: {
          type: 'number',
          example: 200,
        },
        viewLimit: {
          type: 'number',
          example: 1000,
        },
        viewCount: {
          type: 'number',
          example: 500,
        },
        isValid: {
          type: 'boolean',
          example: false,
        },
        rating: {
          type: 'number',
          example: 5,
        },
        totalRating: {
          type: 'number',
          example: 1234,
        },
        totalRater: {
          type: 'number',
          example: 100,
        },
        commentCount: {
          type: 'number',
          example: 1000,
        },
        path: {
          type: 'string',
          example: 'ABCD',
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                example: 'tag1',
              },
              value: {
                type: 'array',
                items: {
                  type: 'string',
                  oneOf: [
                    {
                      type: 'string',
                      example: 'value1',
                    },
                  ],
                },
              },
            },
          },
        },
        searchAbleStart: {
          type: 'string',
          example: '2023-02-23',
        },
        searchAbleEnd: {
          type: 'string',
          example: '2023-02-23',
        },
        createdAt: {
          type: 'string',
          example: '2023-02-22T09:35:23.841Z',
        },
        updatedAt: {
          type: 'string',
          example: '2023-02-22T09:35:23.841Z',
        },
        deletedAt: {
          type: 'string',
          example: null,
        },
        createdBy: {
          type: 'number',
          example: null,
        },
        updatedBy: {
          type: 'number',
          example: null,
        },
        __classes__: {
          type: 'array',
          items: {
            oneOf: [],
          },
        },
        __sessions__: {
          type: 'array',
          items: {
            oneOf: [],
          },
        },
        // __appointments__: {
        //   type: 'array',
        //   items: {
        //     oneOf: [],
        //   },
        // },
      },
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
      example: '',
    },
  },
}

export const paginateListCourse: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  ...schema.properties.data.properties,
                },
              },
              {
                type: 'object',
                properties: {
                  ...schema.properties.data.properties,
                },
              },
            ],
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              example: 1,
            },
            num: {
              type: 'number',
              example: 10,
            },
            itemCount: {
              type: 'number',
              example: 2,
            },
            pageCount: {
              type: 'number',
              example: 1,
            },
            hasPreviousPage: {
              type: 'boolean',
              example: false,
            },
            hasNextPage: {
              type: 'boolean',
              example: false,
            },
          },
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: '',
    },
  },
}

export const courseTypeSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'regular',
          },
          descrition: {
            type: 'string',
            example: 'REGULAR COURSE',
          },
        },
      },
    },
    message: {
      type: 'string',
      example: 'Success',
    },
    status: {
      type: 'number',
      example: 200,
    },
  },
}

// Request Schema
export const courseBaseProperties = {
  ...baseProperties,
  courseType: {
    type: 'string',
    example: 'regular | appointment | workshop',
  },
}

export const QnAschema = {
  type: 'object',
  properties: {
    ...courseBaseProperties,
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            example: 'What is this?',
          },
          answer: {
            type: 'string',
            example: 'This is it',
          },
        },
      },
    },
  },
}

export const coursePublishSuccess: SchemaObject = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      example: 'Course is successfully published',
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
  },
}

export const courseUnPublishSuccess: SchemaObject = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      example: 'Course is successfully published',
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
  },
}
