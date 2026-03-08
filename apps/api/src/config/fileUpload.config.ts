import * as Joi from 'joi'

export type FileUploadConfig = {
  FILE_UPLOAD_LOCATION: string
  FILE_UPLOAD_MAX_FILE_SIZE: number
}

export const fileUploadConfigSchema = Joi.object<FileUploadConfig>({
  FILE_UPLOAD_LOCATION: Joi.string().default('./uploads'),
  FILE_UPLOAD_MAX_FILE_SIZE: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .default(10485760)
    .custom((value) => {
      const parsed = typeof value === 'string' ? parseInt(value, 10) : value
      if (isNaN(parsed) || parsed < 0) return 10485760
      return parsed
    }),
}).required()
