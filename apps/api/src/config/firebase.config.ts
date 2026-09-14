import * as Joi from 'joi'

export type FirebaseConfig = {
  FIREBASE_PROJECT_ID: string
  FIREBASE_PRIVATE_KEY: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_CLIENT_ID: string
}

export const firebaseConfigSchema = Joi.object<FirebaseConfig>({
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_CLIENT_ID: Joi.string().required(),
}).required()
