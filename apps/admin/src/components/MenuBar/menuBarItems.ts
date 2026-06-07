/* eslint-disable import/prefer-default-export */
import { GrCertificate, GrDocumentUpdate, GrSchedulePlay } from 'react-icons/gr'
import {
  LuAppWindow,
  LuBookMarked,
  LuCalendarCheck,
  LuCalendarClock,
  LuCreditCard,
  LuFileText,
  LuGitCompare,
  LuHome,
  LuLink,
  LuMapPin,
  LuMegaphone,
  LuMessageCircle,
  LuMessageSquare,
  LuRocket,
  LuScrollText,
  LuTable,
  LuUser,
  LuUserPlus,
  LuUsers,
  LuWallet,
} from 'react-icons/lu'
// import LessonDateTimeIcon from '@/assets/svgs/LessonDateTimeIcon'
import { RiWhatsappLine } from 'react-icons/ri'

// import LessonDateTimeIcon from '@/assets/svgs/LessonDateTimeIcon'
import { UserRole } from '@/stores/userPermissionData'
import { SiteFeature } from '@/types/site-feature'

export type FeatureSiteMap = Map<SiteFeature, number[]>

export enum FeatureMenu {
  TemplateManagement = 'headings.templateManagement',
  BulkSendDocuments = 'bulkSendDocuments',
  CertificateTemplates = 'certificateTemplates',
  PaymentCampaign = 'paymentCampaign',
  LessonMatrix = 'lessonMatrix',
  BundleDiscounts = 'bundleDiscounts',
  ClassMaterialsSubMenu = 'classMaterialsSubMenu',
  StudentSubmission = 'studentSubmission',
  ClassMaterials = 'classMaterials',
}
export type MenuItem = {
  label: string | FeatureMenu
  icon: React.FC
  path: string
  permissions: UserRole[]
  availableSites?: number[]
  variables?: Record<string, any>
}

// design permission later

const menuItems: MenuItem[] = [
  {
    label: 'home',
    icon: LuHome,
    path: '/home',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'dashboard',
    icon: LuRocket,
    path: '/dashboard',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'profile',
    icon: LuUser,
    path: '/settings/users/profile?userId=$userId&view=profile',
    variables: {
      $userId: 'currentUser.id',
    },
    permissions: [UserRole.Instructor, UserRole.Operations],
  },

  {
    label: 'headings.applications',
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'student',
    icon: LuWallet,
    path: '/application',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
      UserRole.Operations,
    ],
  },

  {
    label: 'studentRecord',
    icon: LuUsers,
    path: '/student-record',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
      UserRole.Operations,
    ],
  },

  {
    label: 'headings.schedule',
    icon: LuRocket,
    path: '#',
    permissions: [],
  },
  {
    label: 'classSchedule',
    icon: LuCalendarClock,
    path: '/full-calendar',
    // change to full-calendar soon
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
      UserRole.Instructor,
      UserRole.Operations,
    ],
  },
  {
    label: FeatureMenu.LessonMatrix,
    icon: LuTable,
    path: '/lesson-matrix',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'rescheduleApproval',
    icon: GrSchedulePlay,
    path: '/reschedule-approval',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  // {
  //   label: 'classSchedule',
  //   icon: LuCalendarClock,
  //   path: '/course-calendar',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //     UserRole.Operations,
  //   ],
  // },

  {
    label: 'headings.courses',
    icon: LuRocket,
    path: '#',
    permissions: [],
  },
  {
    label: 'teachingService',
    icon: LuBookMarked,
    path: '/teaching-service',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
      UserRole.Operations,
    ],
  },

  {
    label: 'availability',
    icon: LuCalendarCheck,
    path: '/availability',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
      UserRole.Instructor,
      UserRole.Operations,
    ],
  },

  {
    label: FeatureMenu.ClassMaterials,
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: FeatureMenu.ClassMaterialsSubMenu,
    icon: LuBookMarked,
    path: '/materials',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: FeatureMenu.StudentSubmission,
    icon: LuFileText,
    path: '/student-submissions',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SchoolAdmin,
      UserRole.SiteAdmin,
    ],
    availableSites: [],
  },

  {
    label: 'headings.staffAndLocation',
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'userManagement',
    icon: LuUserPlus,
    path: '/settings/users',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'locations',
    icon: LuMapPin,
    path: '/locations',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'headings.revenue',
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'applicationForm',
    icon: LuFileText,
    path: '/settings/application-form',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'payment',
    icon: LuCreditCard,
    path: '/settings/payments',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'promotion',
    icon: LuMegaphone,
    path: '/promotion',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  // {
  //   label: 'customDataField',
  //   icon: AiOutlineForm,
  //   path: '/settings/student-information-field',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //     UserRole.Operations,
  //   ],
  // },

  {
    label: 'headings.settings',
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'homepage',
    icon: LuHome,
    path: '/school',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },
  {
    label: 'contact',
    icon: LuMessageSquare,
    path: '/contact',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  // {
  //   label: 'subscription',
  //   icon: LuCreditCard,
  //   path: '/subscription',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //     UserRole.Operations,
  //   ],
  // },

  {
    label: 'featureEnable',
    icon: LuGitCompare,
    path: '/feature-enable',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'headings.messages',
    icon: LuMessageCircle,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'whatsappTemplate',
    icon: RiWhatsappLine,
    path: '/whatsapp-templates',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  {
    label: 'notificationLog',
    icon: LuScrollText,
    path: '/notification-log',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
  },

  // {
  //   label: 'automationFlow',
  //   icon: LuWorkflow,
  //   path: '/automation-flows',
  //   // availableSites: [318],
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //   ],
  // },

  {
    label: FeatureMenu.TemplateManagement,
    icon: LuRocket,
    path: '#',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
    availableSites: [],
  },
  {
    label: FeatureMenu.BulkSendDocuments,
    icon: GrDocumentUpdate,
    path: '/bulk-send-documents',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
    availableSites: [],
  },
  {
    label: FeatureMenu.CertificateTemplates,
    icon: GrCertificate,
    path: '/certificate-templates',
    permissions: [
      UserRole.MasterAdmin,
      UserRole.SiteAdmin,
      UserRole.SchoolAdmin,
    ],
    availableSites: [],
  },
  // {
  //   label: FeatureMenu.InvoiceTemplates,
  //   icon: TbFileInvoice,
  //   path: '/invoice-templates',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //   ],
  //   availableSites: [],
  // },
  // {
  //   label: 'receiptTemplates',
  //   icon: LuReceipt,
  //   path: '/receipt-templates',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //   ],
  // },
  {
    label: 'headings.admin',
    icon: LuRocket,
    path: '#',
    permissions: [UserRole.MasterAdmin],
    availableSites: [],
  },

  {
    label: 'admin',
    icon: LuUser,
    path: '/admin',
    permissions: [UserRole.MasterAdmin],
  },
]

const menuLabelFeatureMap = new Map<FeatureMenu, SiteFeature>([
  [FeatureMenu.TemplateManagement, SiteFeature.TemplateManagement],
  [FeatureMenu.BulkSendDocuments, SiteFeature.BulkSendDocuments],
  [FeatureMenu.CertificateTemplates, SiteFeature.CertificateTemplates],
  [FeatureMenu.PaymentCampaign, SiteFeature.PaymentCampaign],
  [FeatureMenu.LessonMatrix, SiteFeature.LessonMatrix],
  [FeatureMenu.BundleDiscounts, SiteFeature.BundleDiscounts],
  [FeatureMenu.ClassMaterials, SiteFeature.ClassMaterials],
  [FeatureMenu.ClassMaterialsSubMenu, SiteFeature.ClassMaterials],
  [FeatureMenu.StudentSubmission, SiteFeature.ClassMaterials],
])

export const buildMenuItems = (featureSiteMap: FeatureSiteMap) => {
  return menuItems.map(item => {
    const menuItem: MenuItem = { ...item }
    // Apply feature-specific availableSites
    const featureName = menuLabelFeatureMap.get(item.label as FeatureMenu)
    menuItem.availableSites = featureName
      ? featureSiteMap.get(featureName) || []
      : []
    return menuItem
  })
}
export default menuItems
