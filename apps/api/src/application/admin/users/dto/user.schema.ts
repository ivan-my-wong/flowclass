export const usersSchema = {
  oneOf: [
    {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            content: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  example: 1,
                },
                email: {
                  type: 'string',
                  example: 'user@example.com',
                },
                gender: {
                  type: 'string',
                  example: 'Male',
                },
                firstName: {
                  type: 'string',
                  example: 'Flow',
                },
                lastName: {
                  type: 'string',
                  example: 'Class',
                },
                userNameLower: {
                  type: 'string',
                  example: 'FLOWCLASS',
                },
                displayId: {
                  type: 'string',
                  example: null,
                },
                isEmailVerified: {
                  type: 'boolean',
                  example: 'true',
                },
                phone: {
                  type: 'string',
                  example: null,
                },
                lastActiveTime: {
                  type: 'Date',
                  example: null,
                },
                avatar: {
                  type: 'string',
                  example: null,
                },
                avatarUrl: {
                  type: 'string',
                  example: null,
                },
                company: {
                  type: 'string',
                  example: null,
                },
                position: {
                  type: 'string',
                  example: null,
                },
                social: {
                  type: 'string',
                  example: null,
                },
                country: {
                  type: 'string',
                  example: null,
                },

                visibility: {
                  type: 'string',
                  example: null,
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
    },
    {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            content: {
              type: 'object',
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
    },
  ],
}

export const responseCreateUserSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        gender: {
          type: 'string',
          example: 'Male',
        },
        firstName: {
          type: 'string',
          example: 'Flow',
        },
        lastName: {
          type: 'string',
          example: 'Class',
        },
        userNameLower: {
          type: 'string',
          example: 'FLOWCLASS',
        },
        displayId: {
          type: 'string',
          example: null,
        },
        isEmailVerified: {
          type: 'boolean',
          example: 'true',
        },
        phone: {
          type: 'string',
          example: null,
        },
        lastActiveTime: {
          type: 'Date',
          example: null,
        },
        avatar: {
          type: 'string',
          example: null,
        },
        avatarUrl: {
          type: 'string',
          example: null,
        },
        company: {
          type: 'string',
          example: null,
        },
        position: {
          type: 'string',
          example: null,
        },
        social: {
          type: 'string',
          example: null,
        },
        country: {
          type: 'string',
          example: null,
        },

        visibility: {
          type: 'string',
          example: null,
        },
        deletedAt: {
          type: 'Date',
          example: null,
        },
        createdBy: {
          type: 'Date',
          example: null,
        },
        updatedBy: {
          type: 'Date',
          example: null,
        },
        createdAt: {
          type: 'Date',
          example: null,
        },
        updatedAt: {
          type: 'Date',
          example: null,
        },
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

export const meSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        gender: {
          type: 'string',
          example: 'Male',
        },
        firstName: {
          type: 'string',
          example: 'Flow',
        },
        lastName: {
          type: 'string',
          example: 'Class',
        },
        userNameLower: {
          type: 'string',
          example: 'FLOWCLASS',
        },
        displayId: {
          type: 'string',
          example: null,
        },
        isEmailVerified: {
          type: 'boolean',
          example: 'true',
        },
        phone: {
          type: 'string',
          example: null,
        },
        lastActiveTime: {
          type: 'Date',
          example: null,
        },
        avatar: {
          type: 'string',
          example: null,
        },
        avatarUrl: {
          type: 'string',
          example: null,
        },
        company: {
          type: 'string',
          example: null,
        },
        position: {
          type: 'string',
          example: null,
        },
        social: {
          type: 'string',
          example: null,
        },
        country: {
          type: 'string',
          example: null,
        },

        visibility: {
          type: 'string',
          example: null,
        },
        deletedAt: {
          type: 'Date',
          example: null,
        },
        createdBy: {
          type: 'Date',
          example: null,
        },
        updatedBy: {
          type: 'Date',
          example: null,
        },
        createdAt: {
          type: 'Date',
          example: null,
        },
        updatedAt: {
          type: 'Date',
          example: null,
        },
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

export const userSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        gender: {
          type: 'string',
          example: 'Male',
        },
        firstName: {
          type: 'string',
          example: 'Flow',
        },
        lastName: {
          type: 'string',
          example: 'Class',
        },
        userNameLower: {
          type: 'string',
          example: 'FLOWCLASS',
        },
        displayId: {
          type: 'string',
          example: null,
        },
        isEmailVerified: {
          type: 'boolean',
          example: 'true',
        },
        phone: {
          type: 'string',
          example: null,
        },
        lastActiveTime: {
          type: 'Date',
          example: null,
        },
        avatar: {
          type: 'string',
          example: null,
        },
        avatarUrl: {
          type: 'string',
          example: null,
        },
        company: {
          type: 'string',
          example: null,
        },
        position: {
          type: 'string',
          example: null,
        },
        social: {
          type: 'string',
          example: null,
        },
        country: {
          type: 'string',
          example: null,
        },

        visibility: {
          type: 'string',
          example: null,
        },
        deletedAt: {
          type: 'Date',
          example: null,
        },
        createdBy: {
          type: 'Date',
          example: null,
        },
        updatedBy: {
          type: 'Date',
          example: null,
        },
        createdAt: {
          type: 'Date',
          example: null,
        },
        updatedAt: {
          type: 'Date',
          example: null,
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
