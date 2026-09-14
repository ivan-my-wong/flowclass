import TagManager, { DataLayerArgs } from 'react-gtm-module'

export enum GtmEvent {
  pageView = 'page_view',
  addPaymentInfo = 'add_payment_info',
  beginCheckout = 'begin_checkout',
  login = 'login',
  purchase = 'purchase',
  signUp = 'sign_up',

  // Creating new stuff
  createSite = 'create_site',
  createCourse = 'create_course',
  createClass = 'create_class',
  createSession = 'create_session',

  // Updating existing stuff
  updateSchoolLogo = 'update_school_logo',
  updateSchoolBanner = 'update_school_banner',
  updateSchoolEmail = 'update_school_email',
  updateCoursePublish = 'update_course_publish',

  // Use feature
  useAiGenerate = 'use_ai_generate',

  // Connect
  connectStripeExpress = 'connect_stripe-express',
}

export const setGtmEvent = (
  data: {
    event?: GtmEvent
  } & Record<string, any>
) => {
  const tagManagerArgs: DataLayerArgs = {
    dataLayer: {
      ...data,
    },
    dataLayerName: 'PageDataLayer',
  }
  TagManager.dataLayer(tagManagerArgs)
}
