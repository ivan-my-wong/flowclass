import i18n, { Resource } from 'i18next'
import detector from 'i18next-browser-languagedetector'
// Importing translation files
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'
import { initReactI18next } from 'react-i18next'

import accountEN from './locales/en/account.json'
import aiToolEN from './locales/en/aiTool.json'
import availabilityEN from './locales/en/availability.json'
import calendarEN from './locales/en/calendar.json'
import commonEN from './locales/en/common.json'
import componentEN from './locales/en/component.json'
import customMessageEn from './locales/en/customMessage.json'
import embedEN from './locales/en/embed.json'
import integrationEN from './locales/en/integration.json'
import invoiceCampaignEN from './locales/en/invoiceCampaign.json'
import lessonDateTimeEN from './locales/en/lessonDateTime.json'
import lessonMatrixEn from './locales/en/lessonMatrix.json'
import locationEN from './locales/en/location.json'
import loginEN from './locales/en/login.json'
import materialEn from './locales/en/material.json'
import onboardingEN from './locales/en/onboarding.json'
import payoutEN from './locales/en/payout.json'
import pricingPlanEN from './locales/en/pricingPlan.json'
import promotionEN from './locales/en/promotion.json'
import recordLogsEN from './locales/en/recordLogs.json'
import schoolEN from './locales/en/school.json'
import settingEN from './locales/en/setting.json'
import statisticsEN from './locales/en/statistics.json'
import studentEN from './locales/en/student.json'
import studentSubmissionEn from './locales/en/studentSubmission.json'
import subscriptionEN from './locales/en/subscription.json'
import teachingServiceEN from './locales/en/teachingService.json'
import templateManagementEN from './locales/en/templateManagement.json'
import whatsappTemplateEn from './locales/en/whatsappTemplate.json'
// Importing translation files
import accountZH from './locales/zh/account.json'
import availabilityZH from './locales/zh/availability.json'
import calendarZH from './locales/zh/calendar.json'
import commonZH from './locales/zh/common.json'
import componentZH from './locales/zh/component.json'
import customMessageZH from './locales/zh/customMessage.json'
import embedZH from './locales/zh/embed.json'
import integrationZH from './locales/zh/integration.json'
import invoiceCampaignZH from './locales/zh/invoiceCampaign.json'
import lessonDateTimeZh from './locales/zh/lessonDateTime.json'
import lessonMatrixZH from './locales/zh/lessonMatrix.json'
import locationZH from './locales/zh/location.json'
import loginZH from './locales/zh/login.json'
import materialZh from './locales/zh/material.json'
import onboardingZH from './locales/zh/onboarding.json'
import payoutZH from './locales/zh/payout.json'
import pricingPlanZH from './locales/zh/pricingPlan.json'
import promotionZH from './locales/zh/promotion.json'
import recordLogsZH from './locales/zh/recordLogs.json'
import schoolZH from './locales/zh/school.json'
import settingZH from './locales/zh/setting.json'
import statisticsZH from './locales/zh/statistics.json'
import studentZH from './locales/zh/student.json'
import studentSubmissionZH from './locales/zh/studentSubmission.json'
import subscriptionZH from './locales/zh/subscription.json'
import teachingServiceZH from './locales/zh/teachingService.json'
import templateManagementZH from './locales/zh/templateManagement.json'
import whatsappTemplateZH from './locales/zh/whatsappTemplate.json'

// Creating object with the variables of imported translation files
export const resources: Resource = {
  en: {
    calendar: calendarEN,
    common: commonEN,
    component: componentEN,
    onboarding: onboardingEN,
    setting: settingEN,
    subscription: subscriptionEN,
    pricingPlan: pricingPlanEN,
    login: loginEN,
    school: schoolEN,
    account: accountEN,
    teachingService: teachingServiceEN,
    promotion: promotionEN,
    student: studentEN,
    embed: embedEN,
    payout: payoutEN,
    lessonDateTime: lessonDateTimeEN,
    recordLogs: recordLogsEN,
    aiTool: aiToolEN,
    whatsappTemplate: whatsappTemplateEn,
    location: locationEN,
    availability: availabilityEN,
    customMessage: customMessageEn,
    integration: integrationEN,
    templateManagement: templateManagementEN,
    invoiceCampaign: invoiceCampaignEN,
    lessonMatrix: lessonMatrixEn,
    material: materialEn,
    studentSubmission: studentSubmissionEn,
    statistics: statisticsEN,
  },
  zh: {
    calendar: calendarZH,
    common: commonZH,
    component: componentZH,
    onboarding: onboardingZH,
    setting: settingZH,
    subscription: subscriptionZH,
    pricingPlan: pricingPlanZH,
    login: loginZH,
    account: accountZH,
    school: schoolZH,
    teachingService: teachingServiceZH,
    recordLogs: recordLogsZH,
    promotion: promotionZH,
    student: studentZH,
    embed: embedZH,
    payout: payoutZH,
    lessonDateTime: lessonDateTimeZh,
    whatsappTemplate: whatsappTemplateZH,
    location: locationZH,
    availability: availabilityZH,
    integration: integrationZH,
    customMessage: customMessageZH,
    templateManagement: templateManagementZH,
    invoiceCampaign: invoiceCampaignZH,
    lessonMatrix: lessonMatrixZH,
    material: materialZh,
    studentSubmission: studentSubmissionZH,
    statistics: statisticsZH,
  },
}

// i18N Initialization

i18n
  .use(ChainedBackend)
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: [
      'calendar',
      'common',
      'component',
      'onboarding',
      'subscription',
      'setting',
      'login',
      'account',
      'school',
      'student',
      'embed',
      'aiTool',
      'lessonDateTime',
      'availability',
      'integration',
      'customMessage',
      'invoiceCampaign',
      'lessonMatrix',
      'material',
      'studentSubmission',
      'statistics',
    ],
    defaultNS: 'common',
    keySeparator: '.',
    nsSeparator: ':',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 7 * 24 * 60 * 60 * 1000,
        },
        {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      ],
    },
  })

export default i18n
