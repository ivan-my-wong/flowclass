import { BsCodeSquare } from 'react-icons/bs'
import { FaUsersCog } from 'react-icons/fa'
import { FiFileText } from 'react-icons/fi'
import { IoMdGlobe } from 'react-icons/io'
import { MdBuild, MdDomain } from 'react-icons/md'

import { Card } from '../../components/Cards/ActionCard'

export enum SettingCategory {
  Website = 'website',
  User = 'user',
  Communication = 'communication',
  Service = 'service',
  SystemSetting = 'SystemSetting',
  EnrollmentForm = 'EnrollmentForm',
  Payment = 'payment',
  FirstTime = 'firstTime',
}

export const cardItems: Card<SettingCategory>[] = [
  {
    label: 'setting:menu.languageTimezone',
    icon: <IoMdGlobe />,
    path: '/contact?tab=regionLanguage',
    category: SettingCategory.Website,
  },
  // {
  //   label: 'setting:menu.webpage',
  //   icon: <HiOutlineDesktopComputer />,
  //   path: '/settings/webpage-setting',
  //   category: SettingCategory.Website,
  //   // disabled: true,
  // },

  {
    label: 'setting:menu.domainSettings',
    icon: <MdDomain />,
    path: '/settings/domain',
    category: SettingCategory.Website,
  },
  {
    label: 'setting:menu.userPermission',
    icon: <FaUsersCog />,
    path: '/settings/users',
    category: SettingCategory.Website,
  },
  {
    label: 'component:menubar.embed',
    icon: <BsCodeSquare />,
    path: '/embed',
    category: SettingCategory.Website,
  },
  // {
  //   label: 'setting:menu.socialMedia',
  //   icon: <BsFacebook />,
  //   path: '/settings/social-media',
  //   category: SettingCategory.Website,
  //   // disabled: true,
  // },
  {
    label: 'setting:menu.webPanel',
    icon: <MdBuild />,
    path: '/settings/website-panel',
    category: SettingCategory.User,
  },

  // {
  //   label: 'setting:menu.engagementTool',
  //   icon: <BsFillPeopleFill />,
  //   path: '/',
  //   category: SettingCategory.Communication,
  //   disabled: true,
  // },

  // {
  //   label: 'setting:menu.appointment',
  //   icon: <FaUserClock />,
  //   path: '/',
  //   category: SettingCategory.Communication,
  //   disabled: true,
  // },

  // {
  //   label: 'setting:menu.studentInformationField',
  //   icon: <AiOutlineForm />,
  //   path: '/settings/student-information-field',
  //   category: SettingCategory.EnrollmentForm,
  // },

  // {
  //   label: 'setting:menu.applicationForm',
  //   icon: <FaWpforms />,
  //   path: '/settings/application-form',
  //   category: SettingCategory.EnrollmentForm,
  // },
  {
    label: 'setting:menu.T&C',
    icon: <FiFileText />,
    path: '/settings/terms-conditions',
    category: SettingCategory.EnrollmentForm,
  },
  // {
  //   label: 'setting:menu.blockTime',
  //   icon: <ImBlocked />,
  //   path: '/settings/block-time',
  //   category: SettingCategory.EnrollmentForm,
  // },
  // {
  //   label: 'setting:menu.additionalFee',
  //   icon: <TbFileDollar />,
  //   path: '/settings/additional-fee',
  //   category: SettingCategory.EnrollmentForm,
  // },
]
