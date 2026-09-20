import * as Joi from 'joi'

export type FileUploadConfig = {
  FILE_UPLOAD_LOCATION: string
  FILE_UPLOAD_MAX_FILE_SIZE: number
}

export const fileUploadConfigSchema = Joi.object<FileUploadConfig>({
  FILE_UPLOAD_LOCATION: Joi.string().default('./uploads'),
  FILE_UPLOAD_MAX_FILE_SIZE: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .default(10485760),
})
