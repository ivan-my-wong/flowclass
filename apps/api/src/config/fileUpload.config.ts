import * as Joi from 'joi'

export type FileUploadConfig = {
  FILE_UPLOAD_LOCATION: string
  FILE_UPLOAD_MAX_FILE_SIZE: number
}

export const fileUploadConfigSchema = Joi.object<FileUploadConfig>({
  FILE_UPLOAD_LOCATION: Joi.string().required(),
  FILE_UPLOAD_MAX_FILE_SIZE: Joi.string()
    .required()
    .custom((value, helpers) => {
      const parsed = parseInt(value, 10)
      if (isNaN(parsed) || parsed < 0) {
        return helpers.error('any.invalid')
      }
      return value
    }),
}).required()
