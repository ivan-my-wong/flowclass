import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TFunction } from 'i18next'
import { LuArrowRight } from 'react-icons/lu'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import CollapsibleSidebar from '@/components/ui/CollapsibleSidebar'
import { Progress } from '@/components/ui/Progress'
import { defaultTaskState } from '@/constants/onboarding/onboarding'
import { cn } from '@/utils/cn'

import CheckProgress from '../CheckProgress'

import CollapsibleTaskGroup from './CollapsibleTaskGroup'
import TaskItem from './TaskItem'

type RightTaskGroupSectionProps = {
  t: TFunction
  className?: string
  isCollapsed: boolean
  onCollapse: (isCollapsed: boolean) => void
}

const RightTaskGroupSection = ({
  t,
  isCollapsed,
  onCollapse,
  className,
}: RightTaskGroupSectionProps): JSX.Element => {
  const [hasStripe, setHasStripe] = useState(0)
  const [tasks, setTasks] = useState(defaultTaskState)
  const navigate = useNavigate()
  const CheckProgressObject = CheckProgress()
  const updateStripe = useCallback(async () => {
    const res = await CheckProgressObject.checkStripe()
    setHasStripe(res)
  }, [])

  useEffect(() => {
    setTasks({
      ...tasks,
      checkIntlSettings: CheckProgressObject.checkIntlSettings(),
      checkTimezoneSettings: CheckProgressObject.checkTimezoneSettings(),
      checkDomain: CheckProgressObject.checkDomain(),
      checkSchoolInfo: CheckProgressObject.checkSchoolInfo(),
      checkSchoolContact: CheckProgressObject.checkSchoolContact(),
      checkSchoolLogo: CheckProgressObject.checkSchoolLogo(),
      checkSchoolBanner: CheckProgressObject.checkSchoolBanner(),
      checkSchoolGallery: CheckProgressObject.checkSchoolGallery(),
      checkEmailNotiSetting: CheckProgressObject.checkEmailNotiSetting(),
      checkTermsConditions: CheckProgressObject.checkTermsConditions(),
      checkSeo: CheckProgressObject.checkSeo(),
      checkSocialMedia: CheckProgressObject.checkSocialMedia(),
      checkSchoolDescription: CheckProgressObject.checkSchoolDescription(),
      checkHaveCourse: CheckProgressObject.checkHaveCourse(),
      checkHaveClass: CheckProgressObject.checkHaveClass(),
      checkHaveTag: CheckProgressObject.checkHaveTag(),
      checkRegistrationMessage: CheckProgressObject.checkRegistrationMessage(),
      checkCoursePath: CheckProgressObject.checkCoursePath(),
      checkCourseDescription: CheckProgressObject.checkCourseDescription(),
      checkCoursePrice: CheckProgressObject.checkCoursePrice(),
      checkSchedule: CheckProgressObject.checkSchedule(),
      checkPublished: CheckProgressObject.checkPublished(),
      checkPlan: CheckProgressObject.checkPlan(),
      checkAttendanceModifications:
        CheckProgressObject.checkAttendanceModifications(),
      checkBlockTime: CheckProgressObject.checkBlockTime(),
      checkApplicationFormFields:
        CheckProgressObject.checkApplicationFormFields(),
      checkApplicationForm: CheckProgressObject.checkApplicationForm(),
      checkCurrentApplicationForm:
        CheckProgressObject.checkCurrentApplicationForm(),
      checkCouponFixedAmount: CheckProgressObject.checkCouponFixedAmount(),
      checkCouponPercentage: CheckProgressObject.checkCouponPercentage(),
      checkTimezone: CheckProgressObject.checkTimezone(),
      checkTemplateAndThemeColor:
        CheckProgressObject.checkTemplateAndThemeColor(),
      checkCustomWebsite: CheckProgressObject.checkCustomWebsite(),
      checkPayoutMethod: CheckProgressObject.checkPayoutMethod(),
      checkAdditionalFee: CheckProgressObject.checkAdditionalFee(),
      checkWhatsappSetting: CheckProgressObject.checkWhatsappSetting(),
      checkTestSendWhatsapp: CheckProgressObject.checkTestSendWhatsapp(),
      checkWhatsappTemplate: CheckProgressObject.checkWhatsappTemplate(),
      checkWhatsappSendLessonReminder:
        CheckProgressObject.checkWhatsappSendLessonReminder(),
    })
    updateStripe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calculateSectionCompletion = (tasks: number[]): string => {
    const completed = tasks.filter(task => task === 1).length
    const total = tasks.length
    return `${completed}/${total}`
  }

  const calculateSectionCompletionPercentage = (tasks: number[]): number => {
    const completed = tasks.filter(task => task === 1).length
    const total = tasks.length
    return Math.round((completed / total) * 100)
  }

  return (
    <CollapsibleSidebar
      className={cn(className)}
      isCollapsed={isCollapsed}
      onCollapse={onCollapse}
    >
      <Box
        className={cn('bg-background-layer-2 rounded-md w-full')}
        direction="col"
        align="start"
        gap="base"
      >
        <div className="box-col-full items-start">
          <div className="w-full flex flex-col p-4 space-y-2">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold">
                {t('onboarding:dashboard.gettingStarted')}
              </h1>

              <p className="text-base text-gray-500">
                {calculateSectionCompletionPercentage([
                  ...Object.values(tasks),
                ])}
                %
              </p>
            </div>

            <Progress
              value={calculateSectionCompletionPercentage([
                ...Object.values(tasks),
              ])}
              className="w-full h-2.5"
              indicatorClassName="bg-gray-500"
            />
          </div>
          <div className="w-full px-4">
            <Button
              variant="primary-outline"
              className="w-full"
              iconAfter={<LuArrowRight />}
              onClick={() => navigate('/welcome/set-up')}
            >
              {t('skipDialog.resumeOnboarding')}
            </Button>
          </div>
          <div className="box-col-full justify-between bg-background-layer-2 rounded-lg">
            <CollapsibleTaskGroup
              title={`${t('taskTitle.centre')} (${calculateSectionCompletion([
                tasks.checkSchoolInfo,
                tasks.checkSchoolLogo,
                tasks.checkSchoolBanner,
                tasks.checkSchoolDescription,
                tasks.checkSchoolGallery,
                tasks.checkSchoolContact,
                tasks.checkEmailNotiSetting,
                tasks.checkSocialMedia,
                tasks.checkTermsConditions,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('schoolSettings.contact')}
                link="/contact"
                current={tasks.checkSchoolInfo}
                target={1}
                key={t('schoolSettings.contact')}
              />
              <TaskItem
                title={t('schoolSettings.logo')}
                link="/school"
                current={tasks.checkSchoolLogo}
                target={1}
                key={t('schoolSettings.logo')}
              />
              <TaskItem
                title={t('schoolSettings.banner')}
                link="/school"
                current={tasks.checkSchoolBanner}
                target={1}
                key={t('schoolSettings.banner')}
              />
              <TaskItem
                title={t('schoolSettings.description')}
                link="/school?tab=description"
                current={tasks.checkSchoolDescription}
                target={1}
                key={t('schoolSettings.description')}
              />
              <TaskItem
                title={t('schoolSettings.gallery')}
                link="/school?tab=gallery"
                current={tasks.checkSchoolGallery}
                target={1}
                key={t('schoolSettings.gallery')}
              />
              <TaskItem
                title={t('schoolSettings.contactInfo')}
                link="/contact"
                current={tasks.checkSchoolContact}
                target={1}
                key={t('schoolSettings.contactInfo')}
              />
              <TaskItem
                title={t('schoolSettings.email')}
                link="/contact?tab=email"
                current={tasks.checkEmailNotiSetting}
                target={1}
                key={t('schoolSettings.email')}
              />
              <TaskItem
                title={t('schoolSettings.socialMedia')}
                link="/contact?tab=social"
                current={tasks.checkSocialMedia}
                target={1}
                key={t('schoolSettings.socialMedia')}
              />
              <TaskItem
                title={t('schoolSettings.terms')}
                link="/school?tab=terms"
                current={tasks.checkTermsConditions}
                target={1}
                key={t('schoolSettings.terms')}
              />
            </CollapsibleTaskGroup>
            <CollapsibleTaskGroup
              title={`${t('taskTitle.course')} (${calculateSectionCompletion([
                tasks.checkHaveCourse,
                tasks.checkCourseDescription,
                tasks.checkSeo,
                tasks.checkHaveClass,
                tasks.checkHaveTag,
                tasks.checkRegistrationMessage,
                tasks.checkCoursePath,
                tasks.checkSchedule,
                tasks.checkPublished,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('courseSettings.createCourse')}
                link="/teaching-service/create-course"
                current={tasks.checkHaveCourse}
                target={1}
                key={t('courseSettings.createCourse')}
              />
              <TaskItem
                title={t('courseSettings.description')}
                link="/teaching-service/edit-course?tab=description"
                current={tasks.checkCourseDescription}
                target={1}
                key={t('courseSettings.description')}
              />
              <TaskItem
                title={t('courseSettings.seo')}
                link="/teaching-service/edit-course?tab=settings&label=seo"
                current={tasks.checkSeo}
                target={1}
                key={t('courseSettings.seo')}
              />
              <TaskItem
                title={t('courseSettings.createClass')}
                link="/teaching-service/create-course"
                current={tasks.checkHaveClass}
                target={1}
                key={t('courseSettings.createClass')}
              />
              <TaskItem
                title={t('courseSettings.addTag')}
                link="/teaching-service/edit-course?tab=settings&label=tags"
                current={tasks.checkHaveTag}
                target={1}
                key={t('courseSettings.addTag')}
              />
              <TaskItem
                title={t('courseSettings.setRegistrationMessage')}
                link="/teaching-service/edit-course?tab=message"
                current={tasks.checkRegistrationMessage}
                target={1}
                key={t('courseSettings.setRegistrationMessage')}
              />
              <TaskItem
                title={t('courseSettings.setPath')}
                link="/teaching-service/edit-course?tab=basic"
                current={tasks.checkCoursePath}
                target={1}
                key={t('schoolSettings.setPath')}
              />
              <TaskItem
                title={t('courseSettings.setSchedule')}
                link="/teaching-service/edit-course?tab=class"
                current={tasks.checkSchedule}
                target={1}
                key={t('courseSettings.setSchedule')}
              />
              <TaskItem
                title={t('courseSettings.publishCourse')}
                link="/teaching-service/edit-course?tab=class"
                current={tasks.checkPublished}
                target={1}
                key={t('courseSettings.publishCourse')}
              />
            </CollapsibleTaskGroup>
            <CollapsibleTaskGroup
              title={`${t('taskTitle.payment')} (${calculateSectionCompletion([
                tasks.checkPlan,
                hasStripe,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('paymentSettings.upgrade')}
                link="/subscription"
                current={tasks.checkPlan}
                target={1}
                key={t('paymentSettings.upgrade')}
              />
              <TaskItem
                title={t('paymentSettings.linkStripe')}
                link="/settings/payments"
                current={hasStripe}
                target={1}
                key={t('siteSettings.linkStripe')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t('taskTitle.calendar')} (${calculateSectionCompletion([
                tasks.checkAttendanceModifications,
                tasks.checkBlockTime,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('calendarSettings.checkAttendanceModifications')}
                link="/full-calendar"
                current={tasks.checkAttendanceModifications}
                target={1}
                key={t('calendarSettings.checkAttendanceModifications')}
              />
              <TaskItem
                title={t('calendarSettings.setClosedDates')}
                link="/settings/block-time"
                current={tasks.checkBlockTime}
                target={1}
                key={t('calendarSettings.setClosedDates')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t(
                'taskTitle.customPayment'
              )} (${calculateSectionCompletion([
                tasks.checkPayoutMethod,
                tasks.checkAdditionalFee,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('customPaymentSettings.addCustomMethods')}
                link="/settings/payments"
                current={tasks.checkPayoutMethod}
                target={1}
                key={t('customPaymentSettings.addCustomMethods')}
              />
              <TaskItem
                title={t('customPaymentSettings.addExtraFees')}
                link="/settings/additional-fee"
                current={tasks.checkAdditionalFee}
                target={1}
                key={t('customPaymentSettings.addExtraFees')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t(
                'taskTitle.customForm'
              )} (${calculateSectionCompletion([
                tasks.checkApplicationFormFields,
                tasks.checkApplicationForm,
                tasks.checkCurrentApplicationForm,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('customFormSettings.createFields')}
                link="/settings/student-information-field"
                current={tasks.checkApplicationFormFields}
                target={1}
                key={t('customFormSettings.createFields')}
              />
              <TaskItem
                title={t('customFormSettings.createForm')}
                link="/settings/application-form"
                current={tasks.checkApplicationForm}
                target={1}
                key={t('customFormSettings.createForm')}
              />
              <TaskItem
                title={t('customFormSettings.useInCourse')}
                link="/teaching-service/edit-course?tab=settings&label=applicationForm"
                current={tasks.checkCurrentApplicationForm}
                target={1}
                key={t('customFormSettings.useInCourse')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t('taskTitle.promotion')} (${calculateSectionCompletion(
                [tasks.checkCouponPercentage, tasks.checkCouponFixedAmount]
              )})`}
              type="multiple"
            >
              <TaskItem
                title={t('promotionSettings.createDiscount')}
                link="/promotion/coupon-code"
                current={tasks.checkCouponPercentage}
                target={1}
                key={t('promotionSettings.createDiscount')}
              />
              <TaskItem
                title={t('promotionSettings.createFixedAmount')}
                link="/promotion/coupon-code"
                current={tasks.checkCouponFixedAmount}
                target={1}
                key={t('promotionSettings.createFixedAmount')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t('taskTitle.siteCheck')} (${calculateSectionCompletion(
                [
                  tasks.checkTimezone,
                  tasks.checkTemplateAndThemeColor,
                  tasks.checkDomain,
                  tasks.checkCustomWebsite,
                ]
              )})`}
              type="multiple"
            >
              <TaskItem
                title={t('siteCheckSettings.checkRegion')}
                link="/contact?tab=regionLanguage"
                current={tasks.checkTimezone}
                target={1}
                key={t('siteCheckSettings.checkRegion')}
              />
              <TaskItem
                title={t('siteCheckSettings.checkTemplate')}
                link="/school?tab=basic"
                current={tasks.checkTemplateAndThemeColor}
                target={1}
                key={t('siteCheckSettings.checkTemplate')}
              />
              <TaskItem
                title={t('siteCheckSettings.checkDomain')}
                link="/school?tab=settings"
                current={tasks.checkDomain}
                target={1}
                key={t('siteCheckSettings.checkDomain')}
              />
              <TaskItem
                title={t('siteCheckSettings.useCustomDomain')}
                link="/school?tab=settings"
                current={tasks.checkCustomWebsite}
                target={1}
                key={t('siteCheckSettings.useCustomDomain')}
              />
            </CollapsibleTaskGroup>

            <CollapsibleTaskGroup
              title={`${t('taskTitle.whatsapp')} (${calculateSectionCompletion([
                tasks.checkWhatsappSetting,
                tasks.checkTestSendWhatsapp,
                tasks.checkWhatsappTemplate,
                tasks.checkWhatsappSendLessonReminder,
              ])})`}
              type="multiple"
            >
              <TaskItem
                title={t('whatsappSettings.twilioApiKey')}
                link="/integrations/twilio"
                current={tasks.checkWhatsappSetting}
                target={1}
                key={t('whatsappSettings.twilioApiKey')}
              />
              <TaskItem
                title={t('whatsappSettings.testSendWhatsapp')}
                link="/integrations/twilio"
                current={tasks.checkTestSendWhatsapp}
                target={1}
                key={t('whatsappSettings.testSendWhatsapp')}
              />
              <TaskItem
                title={t('whatsappSettings.createTemplate')}
                link="/whatsapp-templates/add"
                current={tasks.checkWhatsappTemplate}
                target={1}
                key={t('whatsappSettings.createTemplate')}
              />
            </CollapsibleTaskGroup>
          </div>
        </div>
      </Box>
    </CollapsibleSidebar>
  )
}

export default RightTaskGroupSection
