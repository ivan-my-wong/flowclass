import { lazy, Suspense, useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { HeadProvider, Link } from 'react-head'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

import defaultLogo from '@/assets/logos/flowclass_icon.png'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { LocalStorageKeys } from '@/constants/localStorageKeys'
import useCourseData from '@/hooks/useCourseData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import AppLayout from '@/layouts/AppLayout'
import DefaultContentLayout from '@/layouts/ContentLayout/DefaultContentLayout'
import Preview from '@/pages/Embed/Preview'
import CouponDetailPage from '@/pages/Promotion/Coupons/CouponDetailPage'
import AdditionalFee from '@/pages/Setting/AdditionalFee'
import StudentInfomationField from '@/pages/Setting/CustomDataField'
import ReorderStudentInformation from '@/pages/Setting/CustomDataField/ReorderCustomDataField'
import ManagementPaymentMethodPage from '@/pages/Setting/ManagementPaymentMethod'
import ModalPaymentInfo from '@/pages/Setting/ModalPaymentInfo'
import WebsitePanel from '@/pages/Setting/WebsitePanel'
import AcceptInvitePage from '@/pages/Welcome/AcceptInvitePage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { darkModeState } from '@/stores/darkMode'
import { displayLanguageState } from '@/stores/displayLanguage'
import dayjs from '@/utils/dayjs'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

import { getWebpageStyle } from './api/settingSite'
import GlobalConfirm from './components/Popups/GlobalConfirm'
import { QUERY_KEY } from './constants/queryKey'
import { ConfirmContextProvider } from './contexts/ConfirmContext'
import useSitesFeatureEnabled from './hooks/useSiteFeatureEnableData'
import useTextVersion from './hooks/useTextVersion'
import BlankLayout from './layouts/BlankLayout'
import MaterialList from './pages/Material/List'
import EditPaymentProof from './pages/PaymentProofTable/EditPaymentProof'
import StudentDetail from './pages/StudentDetail'
import StudentSubmissions from './pages/StudentSubmissions'
import UserManagement from './pages/UserManagement'
import { UserRole } from './stores/userPermissionData'
import { SiteFeature } from './types/site-feature'

import '@/styles/globals.css'
import 'react-day-picker/src/style.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'react-quill/dist/quill.snow.css'

const AccountPage = lazy(() => import('@/pages/Account'))
const DeleteAccount = lazy(() => import('@/pages/Account/DeleteAccount'))
const ContactPage = lazy(() => import('@/pages/Contact'))

const ChangePassword = lazy(() => import('@/pages/Account/ChangePassword'))
const ProfilePage = lazy(() => import('@/pages/Account/AccountProfile'))
const Login = lazy(() => import('@/pages/Login'))
const ForgetPassword = lazy(() => import('@/pages/Login/ForgetPassword'))
const DashboardChart = lazy(() => import('@/pages/DashboardChart'))
const RevampedDashboard = lazy(() => import('@/pages/RevampedDashboard'))
const Home = lazy(() => import('@/pages/Home'))
const PageNotFound = lazy(() => import('@/pages/PageNotFound'))

const RegisterPage = lazy(() => import('@/pages/Register'))
const RegisterEBookPage = lazy(() => import('@/pages/Register/eBook'))

const School = lazy(() => import('@/pages/School'))
const StudentCRM = lazy(() => import('@/pages/StudentCRM/index'))

const Setting = lazy(() => import('@/pages/Setting'))
// const SocialMediaPage = lazy(() => import('@/pages/Setting/SocialMediaPage'))

const LocationsPage = lazy(() => import('@/pages/Locations'))
const CreateLocation = lazy(() => import('@/pages/Locations/CreateLocation'))
const UpdateLocation = lazy(() => import('@/pages/Locations/UpdateLocation'))

const Integrations = lazy(() => import('@/pages/Integrations'))
const WhatsappSetting = lazy(
  () => import('@/pages/Integrations/TwilioWhatsApp/WhatsappSetting')
)

const SiteSetting = lazy(() => import('@/pages/Setting/Site/SiteSettings'))
const PaymentSettings = lazy(
  () => import('@/pages/PaymentMethods/PaymentMethodList')
)
const DetailLessonPage = lazy(
  () => import('@/pages/FullCalendar/components/LessonDetail')
)
const ChangeEntireLessonPage = lazy(
  () => import('@/pages/FullCalendar/ChangeEntireLesson')
)

const CreateTeachingService = lazy(
  () => import('@/pages/StudentDetail/components/createTeachingService')
)
const QrCodeView = lazy(() => import('@/pages/FullCalendar/QrCodeView'))

const SchoolList = lazy(() => import('@/pages/SchoolList'))

const UserProfile = lazy(() => import('@/pages/UserManagement/UserProfile'))
const TeachingService = lazy(() => import('@/pages/TeachingService'))

const SelectClassType = lazy(
  () => import('@/pages/TeachingService/EditCourse/Class/SelectClassType')
)
const EditCourse = lazy(() => import('@/pages/TeachingService/EditCourse'))
const StudentTable = lazy(() => import('@/pages/PaymentProofTable'))

const RescheduleApproval = lazy(() => import('@/pages/RescheduleApproval'))
const LessonMatrix = lazy(() => import('@/pages/AttendanceSheet'))

const ConfirmSendPaymentProof = lazy(
  () => import('@/pages/PaymentProofTable/components/ConfirmSendPaymentProof')
)

const SendCustomMessages = lazy(
  () => import('@/pages/PaymentProofTable/SendCustomMessages')
)

const Promotion = lazy(() => import('@/pages/Promotion'))
const CouponCodePage = lazy(
  () => import('@/pages/Promotion/Coupons/CouponCodePage')
)

const BundleDiscountsPage = lazy(
  () => import('@/pages/Promotion/BundleDiscounts/BundleDiscounts')
)

const TrialLessonPage = lazy(
  () => import('@/pages/Promotion/TrialLesson/TrialLessonPage')
)

const GoogleCalendarSetting = lazy(
  () => import('@/pages/Integrations/GoogleCalendar')
)

const GoogleMeetSetting = lazy(() => import('@/pages/Integrations/GoogleMeet'))

const GoogleSheetSetting = lazy(
  () => import('@/pages/Integrations/GoogleSheet')
)

const GoogleDriveSetting = lazy(
  () => import('@/pages/Integrations/GoogleDrive')
)

const ManageTrialLesson = lazy(
  () => import('@/pages/Promotion/TrialLesson/ManageTrialLesson')
)
const BundleDiscountDetail = lazy(
  () => import('@/pages/Promotion/BundleDiscounts/BundleDiscountDetail')
)
const CreateBundleDiscount = lazy(
  () => import('@/pages/Promotion/BundleDiscounts/CreateBundleDiscount')
)
const EditBundleDiscount = lazy(
  () => import('@/pages/Promotion/BundleDiscounts/EditBundleDiscount')
)
const PackageDiscountsPage = lazy(
  () => import('@/pages/Promotion/PackageDiscounts/PackageDiscounts')
)
const PackageDiscountDetail = lazy(
  () => import('@/pages/Promotion/PackageDiscounts/PackageDiscountDetail')
)
const CreatePackageDiscount = lazy(
  () => import('@/pages/Promotion/PackageDiscounts/CreatePackageDiscount')
)
const EditPackageDiscount = lazy(
  () => import('@/pages/Promotion/PackageDiscounts/EditPackageDiscount')
)
const AdminPage = lazy(() => import('@/pages/Admin'))

const Embed = lazy(() => import('@/pages/Embed'))
const SetUpPage = lazy(() => import('@/pages/Welcome/SetUp'))
const ResetPassword = lazy(() => import('@/pages/Login/ResetPassword'))
const EmailSetting = lazy(
  () => import('@/pages/Setting/FeatureEnable/EmailSetting')
)
const WhatsappTemplate = lazy(() => import('@/pages/WhatsappTemplate'))
const ManageWhatsappTemplate = lazy(
  () => import('@/pages/WhatsappTemplate/ManageWhatsappTemplateModal')
)
const CustomMessages = lazy(() => import('@/pages/CustomMessages'))

const ManageCustomMessages = lazy(
  () => import('@/pages/CustomMessages/ManageCustomMessageModal')
)

const NotificationLog = lazy(() => import('@/pages/NotificationLog'))

const ApplicationForm = lazy(() => import('@/pages/Setting/ApplicationForm'))

const EditForm = lazy(() => import('@/pages/Setting/ApplicationForm/EditForm'))
const CreateForm = lazy(
  () => import('@/pages/Setting/ApplicationForm/CreateForm')
)

const AvailabilityPage = lazy(
  () => import('@/pages/Availability/AvailabilityPage')
)

const FullCalendar = lazy(() => import('@/pages/FullCalendar/index'))
const FeatureEnable = lazy(() => import('@/pages/Setting/FeatureEnable/index'))

const AvailabilityList = lazy(
  () => import('@/pages/Availability/AvailabilityList')
)

const CertificateTemplates = lazy(
  () => import('@/pages/TemplateManagement/CertificateTemplates')
)
const CertificateTemplatesEditor = lazy(
  () => import('@/pages/TemplateManagement/CertificateTemplates/Editor')
)
const InvoiceTemplates = lazy(
  () => import('@/pages/TemplateManagement/InvoiceTemplates')
)

const CampaignRecipientsPage = lazy(
  () =>
    import('./pages/TemplateManagement/InvoiceTemplates/CampaignRecipientsPage')
)

const InvoiceEditor = lazy(
  () => import('@/pages/TemplateManagement/InvoiceTemplates/Editor')
)
const DialogSendInvoice = lazy(
  () =>
    import(
      '@/pages/TemplateManagement/InvoiceTemplates/Editor/DialogSendInvoice'
    )
)
const SendingProgressPage = lazy(
  () =>
    import(
      '@/pages/TemplateManagement/InvoiceTemplates/Editor/SendingProgressPage'
    )
)
const ModalSelectLessons = lazy(
  () =>
    import('@/pages/TemplateManagement/InvoiceTemplates/Editor/SelectLessons')
)

const ModalAddSubscriptionClass = lazy(
  () =>
    import(
      '@/pages/TemplateManagement/InvoiceTemplates/Editor/AddSubscriptionClass'
    )
)

const ModalPreviewInvoice = lazy(
  () =>
    import(
      '@/pages/TemplateManagement/InvoiceTemplates/Editor/InvoicePreviewModal'
    )
)
const ReceiptTemplates = lazy(
  () => import('@/pages/TemplateManagement/ReceiptTemplates')
)
const BulkSendDocuments = lazy(
  () => import('@/pages/TemplateManagement/BulkSendDocuments')
)
const CampaignDocumentDetails = lazy(
  () => import('@/pages/TemplateManagement/BulkSendDocuments/Select')
)

const themeRoot = document.body

/**
 * Returns an array of route configurations for lesson-related paths
 * @param key - A unique identifier prefix for route keys
 * @returns JSX.Element[] Array of Route components
 */
const LessonRoutes = (key: string): JSX.Element[] => {
  const navigate = useNavigate()
  return [
    <Route
      key={`${key}-lesson-detail`}
      path="lesson/:id"
      element={<ProtectedRoute element={<DetailLessonPage />} />}
    >
      <Route path="update-time" element={<ChangeEntireLessonPage />} />
      {/* <Route path="delay-lessons" element={<DelayFollowingLessonsPage />} /> */}
      <Route
        path="change-student-lesson"
        element={
          <CreateTeachingService open handleClose={() => navigate(-1)} />
        }
      />
      <Route path="view-qrcode" element={<QrCodeView />} />
    </Route>,
  ]
}

const App = (): JSX.Element => {
  const { useFetchAllSchoolData, useFetchCurrentSchool } = useSchoolData()
  const { useFetchAllSiteData } = useSiteData()
  const { useFetchAllCourseData } = useCourseData()
  const isDarkMode = useRecoilValue(darkModeState)
  const { siteData } = useSiteData()
  const { currentSite } = siteData
  const [lang] = useRecoilState(displayLanguageState)

  const { useFetchSitesFeatureEnabled } = useSitesFeatureEnabled()
  const { data: sitesFeatureEnabled } = useFetchSitesFeatureEnabled()
  const enabledBundleDiscounts = useMemo(() => {
    if (!currentSite?.id) return false
    if (!sitesFeatureEnabled) return true
    const bundleDiscounts = sitesFeatureEnabled.find(
      o => o.feature === SiteFeature.BundleDiscounts
    )
    return (
      !bundleDiscounts ||
      bundleDiscounts.siteIds.length === 0 ||
      bundleDiscounts.siteIds.includes(currentSite.id)
    )
  }, [sitesFeatureEnabled, currentSite?.id])

  const enabledPackageDiscounts = useMemo(() => {
    if (!currentSite?.id) return false
    if (!sitesFeatureEnabled) return true
    const packageDiscounts = sitesFeatureEnabled.find(
      o => o.feature === SiteFeature.PackageDiscounts
    )
    return (
      !packageDiscounts ||
      packageDiscounts.siteIds.length === 0 ||
      packageDiscounts.siteIds.includes(currentSite.id)
    )
  }, [sitesFeatureEnabled, currentSite?.id])

  const { data: currentSchoolData } = useFetchCurrentSchool()
  const { data: webpageStyle } = useQuery(
    [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentSchoolData?.id],
    () => getWebpageStyle(currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSchoolData?.id,
    }
  )
  const { changeTextVersion } = useTextVersion()
  const { i18n } = useTranslation()

  useEffect(() => {
    dayjs.tz.setDefault(siteData.currentSite?.timeZone.id)
  }, [siteData.currentSite?.timeZone.id])

  useEffect(() => {
    if (webpageStyle?.textVersion) {
      changeTextVersion(webpageStyle.textVersion)
    }
    i18n.changeLanguage(lang)
  }, [webpageStyle?.textVersion, changeTextVersion, lang, i18n])

  useFetchAllSiteData()
  useFetchAllSchoolData()
  useFetchAllCourseData()

  useEffect(() => {
    if (!localStorage.getItem(LocalStorageKeys.FfBrowserId)) {
      const ffBrowserId = uuidv4() // replace this with your ID generation logic
      localStorage.setItem(LocalStorageKeys.FfBrowserId, ffBrowserId)
    }

    // Generate and overwrite ff-session-id every session
    const ffSessionId = uuidv4() // replace this with your ID generation logic
    localStorage.setItem(LocalStorageKeys.FfSessionId, ffSessionId)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      themeRoot.classList.add('dark')
    } else {
      themeRoot.classList.remove('dark')
    }
  }, [isDarkMode])

  // if (!i18nLoaded) {
  //   return <FullScreenLoading />
  // }

  return (
    <HeadProvider>
      <Link
        id="siteIcon"
        rel="icon"
        type="image/png"
        href={
          getMediaFileUrl(currentSite?.logo) !== ''
            ? getMediaFileUrl(currentSite?.logo)
            : defaultLogo
        }
      />
      <ConfirmContextProvider>
        <Suspense fallback={<FullScreenLoading />}>
          <Routes>
            {/* Public Routes with fully custom canvas */}
            <Route path="/">
              <Route path="" element={<Login />} />
              <Route path="login" element={<Login />} />
              <Route
                path="login/forget-password"
                element={<ForgetPassword />}
              />
              <Route path="login/reset-password" element={<ResetPassword />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="register-event" element={<RegisterEBookPage />} />
              <Route
                path="preview"
                element={<ProtectedRoute element={<Preview />} />}
              />
              <Route path="welcome/set-up" element={<SetUpPage />} />
            </Route>

            {/* Public Routes with preset layout */}
            <Route path="/" element={<DefaultContentLayout />}>
              <Route path="*" element={<PageNotFound />} />
            </Route>

            <Route path="/invite-institution" element={<BlankLayout />}>
              <Route path="" element={<AcceptInvitePage />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>

            <Route
              path="/site"
              element={
                <ProtectedRoute
                  element={<AppLayout />}
                  roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                />
              }
            >
              <Route
                path=""
                element={<ProtectedRoute element={<SchoolList />} />}
              />

              <Route path="admin" element={<Navigate to="/site" replace />} />

              <Route path="settings" element={<SiteSetting />} />
            </Route>

            <Route path="/teaching-service" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<TeachingService />} />}
              />
              <Route
                path="create-course"
                element={<ProtectedRoute element={<SelectClassType />} />}
              />
              <Route
                path="edit-course"
                element={<ProtectedRoute element={<EditCourse />} />}
              />
            </Route>

            <Route path="/" element={<AppLayout />}>
              <Route
                path="school"
                element={<ProtectedRoute element={<School />} />}
              />
              <Route
                path="contact"
                element={<ProtectedRoute element={<ContactPage />} />}
              />
              <Route
                path="embed"
                element={<ProtectedRoute element={<Embed />} />}
              />

              <Route path="dashboard-v2" element={<RevampedDashboard />} />

              <Route
                path="subscription"
                element={<Navigate to="/home" replace />}
              />
              <Route
                path="subscription/create-subscription"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/subscription/preset"
                element={<Navigate to="/home" replace />}
              />
              <Route
                path="/subscription/manage"
                element={<Navigate to="/subscription" replace />}
              />

              <Route
                path="/subscription/management"
                element={<Navigate to="/home" replace />}
              />
              <Route
                path="home"
                element={
                  <ProtectedRoute
                    element={<Home />}
                    roleAllowed={[
                      UserRole.MasterAdmin,
                      UserRole.SiteAdmin,
                      UserRole.SchoolAdmin,
                      UserRole.Instructor,
                      UserRole.Operations,
                    ]}
                  />
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute
                    element={<DashboardChart />}
                    roleAllowed={[
                      UserRole.MasterAdmin,
                      UserRole.SiteAdmin,
                      UserRole.SchoolAdmin,
                    ]}
                  />
                }
              />
              <Route path="application">
                <Route
                  path=""
                  element={<ProtectedRoute element={<StudentTable />} />}
                />
                <Route
                  path="edit"
                  element={<ProtectedRoute element={<EditPaymentProof />} />}
                />
                <Route
                  path="send-custom-messages"
                  element={<ProtectedRoute element={<SendCustomMessages />} />}
                />
                <Route
                  path="send-reminder"
                  element={
                    <ProtectedRoute element={<ConfirmSendPaymentProof />} />
                  }
                />
              </Route>
              <Route path="availability">
                <Route
                  path=""
                  element={<ProtectedRoute element={<AvailabilityList />} />}
                />
                <Route
                  path="edit/:id"
                  element={<ProtectedRoute element={<AvailabilityPage />} />}
                />
              </Route>
              <Route
                path="reschedule-approval"
                element={<ProtectedRoute element={<RescheduleApproval />} />}
              />
              <Route
                path="lesson-matrix"
                element={<ProtectedRoute element={<LessonMatrix />} />}
              />
              <Route
                path="account"
                element={<ProtectedRoute element={<AccountPage />} />}
              />
              <Route
                path="account/update-profile"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />
              <Route
                path="account/change-password"
                element={<ProtectedRoute element={<ChangePassword />} />}
              />
              <Route
                path="account/delete"
                element={<ProtectedRoute element={<DeleteAccount />} />}
              />
              <Route
                path="promotion"
                element={<ProtectedRoute element={<Promotion />} />}
              />
              <Route
                path="promotion/coupon-code"
                element={<ProtectedRoute element={<CouponCodePage />} />}
              />
              <Route
                path="promotion/trial-lesson"
                element={<ProtectedRoute element={<TrialLessonPage />} />}
              >
                <Route
                  path="create"
                  element={<ProtectedRoute element={<ManageTrialLesson />} />}
                />
                <Route
                  path=":trialLessonId/update"
                  element={<ProtectedRoute element={<ManageTrialLesson />} />}
                />
              </Route>
              <Route
                path="student-record"
                element={<ProtectedRoute element={<StudentCRM />} />}
              />
              <Route
                path="student-record/:id"
                element={<ProtectedRoute element={<StudentDetail />} />}
              />
              <Route
                path="promotion/coupon-code/detail"
                element={<ProtectedRoute element={<CouponDetailPage />} />}
              />
              <Route
                path="course-calendar"
                element={<Navigate to="/full-calendar" replace />}
              />

              {enabledBundleDiscounts && (
                <>
                  <Route
                    path="promotion/bundle-discounts"
                    element={
                      <ProtectedRoute element={<BundleDiscountsPage />} />
                    }
                  />
                  <Route
                    path="promotion/bundle-discounts/detail/:bundleId"
                    element={
                      <ProtectedRoute element={<BundleDiscountDetail />} />
                    }
                  />
                  <Route
                    path="promotion/bundle-discounts/add"
                    element={
                      <ProtectedRoute element={<CreateBundleDiscount />} />
                    }
                  />
                  <Route
                    path="promotion/bundle-discounts/edit/:bundleId"
                    element={
                      <ProtectedRoute element={<EditBundleDiscount />} />
                    }
                  />
                </>
              )}

              {enabledPackageDiscounts && (
                <>
                  <Route
                    path="promotion/package-discounts"
                    element={
                      <ProtectedRoute element={<PackageDiscountsPage />} />
                    }
                  />
                  <Route
                    path="promotion/package-discounts/detail/:packageDiscountId"
                    element={
                      <ProtectedRoute element={<PackageDiscountDetail />} />
                    }
                  />
                  <Route
                    path="promotion/package-discounts/add"
                    element={
                      <ProtectedRoute element={<CreatePackageDiscount />} />
                    }
                  />
                  <Route
                    path="promotion/package-discounts/edit/:packageDiscountId"
                    element={
                      <ProtectedRoute element={<EditPackageDiscount />} />
                    }
                  />
                </>
              )}

              <Route
                path="promotion/coupon-code/detail"
                element={<ProtectedRoute element={<CouponDetailPage />} />}
              />

              <Route
                path="admin"
                element={<ProtectedRoute element={<AdminPage />} />}
              />
              <Route
                path="admin/subscription-plans"
                element={<Navigate to="/admin" replace />}
              />
              <Route
                path="admin/subscription-plans/plan-assignment"
                element={<Navigate to="/admin" replace />}
              />

              <Route
                path="notification-log"
                element={<ProtectedRoute element={<NotificationLog />} />}
              />

              <Route
                path="whatsapp-templates"
                element={<ProtectedRoute element={<WhatsappTemplate />} />}
              >
                <Route
                  path="add"
                  element={
                    <ProtectedRoute element={<ManageWhatsappTemplate />} />
                  }
                />
                <Route
                  path="edit"
                  element={
                    <ProtectedRoute element={<ManageWhatsappTemplate />} />
                  }
                />
              </Route>
              <Route
                path="custom-messages"
                element={<ProtectedRoute element={<CustomMessages />} />}
              >
                <Route
                  path="edit"
                  element={
                    <ProtectedRoute element={<ManageCustomMessages />} />
                  }
                />
              </Route>
              <Route path="integrations">
                <Route
                  path=""
                  element={
                    <ProtectedRoute
                      element={<Integrations />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />

                <Route
                  path="twilio"
                  element={
                    <ProtectedRoute
                      element={<WhatsappSetting />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path="google-calendar"
                  element={
                    <ProtectedRoute
                      element={<GoogleCalendarSetting />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path="google-meet"
                  element={
                    <ProtectedRoute
                      element={<GoogleMeetSetting />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path="google-sheet"
                  element={
                    <ProtectedRoute
                      element={<GoogleSheetSetting />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path="google-drive"
                  element={
                    <ProtectedRoute
                      element={<GoogleDriveSetting />}
                      roleAllowed={[
                        UserRole.MasterAdmin,
                        UserRole.SiteAdmin,
                        UserRole.SchoolAdmin,
                      ]}
                    />
                  }
                />
              </Route>
            </Route>

            <Route path="certificate-templates" element={<AppLayout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<CertificateTemplates />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
              <Route
                path="editor"
                element={
                  <ProtectedRoute
                    element={<CertificateTemplatesEditor />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
              <Route
                path="editor/:templateId"
                element={
                  <ProtectedRoute
                    element={<CertificateTemplatesEditor />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
            </Route>
            <Route path="invoice-templates" element={<AppLayout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<InvoiceTemplates />}
                    roleAllowed={[
                      UserRole.MasterAdmin,
                      UserRole.SiteAdmin,
                      UserRole.SchoolAdmin,
                    ]}
                  />
                }
              />

              <Route
                path=":documentId/recipients"
                element={
                  <ProtectedRoute
                    element={<CampaignRecipientsPage />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
              <Route
                path="editor"
                element={
                  <ProtectedRoute
                    element={<InvoiceEditor />}
                    roleAllowed={[
                      UserRole.MasterAdmin,
                      UserRole.SiteAdmin,
                      UserRole.SchoolAdmin,
                    ]}
                  />
                }
              >
                <Route
                  path=":classId/select-lessons"
                  element={<ModalSelectLessons />}
                />
                <Route
                  path=":classId/add-subscription-class"
                  element={<ModalAddSubscriptionClass />}
                />
                <Route path="send-multiple" element={<DialogSendInvoice />} />
                <Route path="send" element={<DialogSendInvoice />} />
                <Route
                  path="sending-progress"
                  element={<SendingProgressPage />}
                />
                <Route path="preview" element={<ModalPreviewInvoice />} />
              </Route>
            </Route>
            <Route path="student-submissions" element={<AppLayout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<StudentSubmissions />}
                    roleAllowed={[
                      UserRole.MasterAdmin,
                      UserRole.SiteAdmin,
                      UserRole.SchoolAdmin,
                    ]}
                  />
                }
              />
            </Route>
            <Route path="receipt-templates" element={<AppLayout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<ReceiptTemplates />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
            </Route>
            <Route path="bulk-send-documents" element={<AppLayout />}>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<BulkSendDocuments />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
              <Route
                path="select"
                element={
                  <ProtectedRoute
                    element={<CampaignDocumentDetails />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
              <Route
                path="select/:campaignId"
                element={
                  <ProtectedRoute
                    element={<CampaignDocumentDetails />}
                    roleAllowed={[UserRole.MasterAdmin, UserRole.SiteAdmin]}
                  />
                }
              />
            </Route>

            <Route path="/settings" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<Setting />} />}
              />

              <Route
                path="website-panel"
                element={<ProtectedRoute element={<WebsitePanel />} />}
              />

              <Route
                path="block-time"
                element={<Navigate to="/settings" replace />}
              />

              <Route
                path="payments"
                element={<ProtectedRoute element={<PaymentSettings />} />}
              >
                <Route
                  path="/settings/payments/add"
                  element={<ManagementPaymentMethodPage />}
                />
                <Route
                  path="/settings/payments/info"
                  element={<ModalPaymentInfo />}
                />
                <Route
                  path="/settings/payments/:id/edit"
                  element={<ManagementPaymentMethodPage />}
                />
              </Route>

              <Route
                path="email-settings"
                element={<ProtectedRoute element={<EmailSetting />} />}
              />

              <Route
                path="student-information-field"
                element={
                  <ProtectedRoute element={<StudentInfomationField />} />
                }
              />
              <Route
                path="student-information-field/reorder"
                element={
                  <ProtectedRoute element={<ReorderStudentInformation />} />
                }
              />

              <Route
                path="application-form"
                element={<ProtectedRoute element={<ApplicationForm />} />}
              >
                <Route
                  path="/settings/application-form/add"
                  element={<ProtectedRoute element={<CreateForm />} />}
                />
                <Route
                  path="/settings/application-form/edit"
                  element={<ProtectedRoute element={<EditForm />} />}
                />
              </Route>

              <Route
                path="/settings/additional-fee"
                element={<ProtectedRoute element={<AdditionalFee />} />}
              />

              <Route
                path="/settings/users"
                element={<ProtectedRoute element={<UserManagement />} />}
              />
              <Route
                path="/settings/users/profile"
                element={<ProtectedRoute element={<UserProfile />} />}
              >
                {LessonRoutes('users')}
              </Route>
            </Route>
            <Route path="locations" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<LocationsPage />} />}
              >
                <Route
                  path="add"
                  element={<ProtectedRoute element={<CreateLocation />} />}
                />
                <Route
                  path=":locationRoomId/update"
                  element={<ProtectedRoute element={<UpdateLocation />} />}
                />
              </Route>
            </Route>
            <Route path="/feature-enable" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<FeatureEnable />} />}
              />
            </Route>

            <Route path="/full-calendar" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<FullCalendar />} />}
              >
                {LessonRoutes('full-calendar')}
              </Route>
            </Route>
            <Route path="materials" element={<AppLayout />}>
              <Route
                path=""
                element={<ProtectedRoute element={<MaterialList />} />}
              />
            </Route>
          </Routes>
          <GlobalConfirm />
        </Suspense>
      </ConfirmContextProvider>
    </HeadProvider>
  )
}

export default App
