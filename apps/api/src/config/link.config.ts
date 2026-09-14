import * as Joi from 'joi'

export type LinkConfig = {
  LINK_FLOWCLASS_CMS: string
}

export const linkConfigSchema = Joi.object<LinkConfig>({
  LINK_FLOWCLASS_CMS: Joi.string().required(),
}).required()
