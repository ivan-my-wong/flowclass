import { FaSchool } from 'react-icons/fa'

import { UserRole } from '../../stores/userPermissionData'

import { MenuItem } from './menuBarItems'

// design permission later

export const siteMenuItems: MenuItem[] = [
  // {
  //   label: 'mySchools',
  //   icon: FaSchool,
  //   path: '/my-school',
  //   permissions: [UserRole.MasterAdmin],
  // },

  {
    label: 'mySchools',
    icon: FaSchool,
    path: '/site',
    permissions: [
      UserRole.MasterAdmin,
      // UserRole.SiteAdmin,
      // UserRole.SchoolAdmin,
      // UserRole.Instructor,
    ],
  },
  // {
  //   label: 'info',
  //   icon: MdOutlineWeb,
  //   path: '/site/info',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //   ],
  // },
  // {
  //   label: 'userManagement',
  //   icon: FaUserFriends,
  //   path: '/site/users',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //   ],
  // },
  // {
  //   label: 'siteSettings',
  //   icon: SettingIcon,
  //   path: '/site/settings/country',
  //   permissions: [
  //     UserRole.MasterAdmin,
  //     UserRole.SiteAdmin,
  //     UserRole.SchoolAdmin,
  //     UserRole.Instructor,
  //   ],
  // },
]
