import { LucideBlocks, LucideBookOpen } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { BsCalendarHeartFill } from 'react-icons/bs'
import { FaUserClock } from 'react-icons/fa'
import { FiToggleRight } from 'react-icons/fi'
import { MdLoop } from 'react-icons/md'

import { ClassType } from '@/types'

export const ClassTypeIcon = ({ classType }: { classType?: string }) => {
  const { t } = useTranslation()
  switch (classType) {
    case ClassType.regular:
      return (
        <div className="box-row-full justify-start">
          <LucideBlocks className="text-primary" />
          <p className="text-sm">{t('course:classType.regular')}</p>
        </div>
      )
    case ClassType.workshop:
      return (
        <div className="box-row-full justify-start">
          <BsCalendarHeartFill className="text-tertiary" />
          <p className="text-sm">{t('course:classType.workshop')}</p>
        </div>
      )
    case ClassType.recurring:
      return (
        <div className="box-row-full justify-start">
          <MdLoop fill="#13c931" />
          <p className="text-sm">{t('course:classType.recurring')}</p>
        </div>
      )

    case ClassType.subscription:
      return (
        <div className="box-row-full justify-start">
          <FiToggleRight className="text-textSubtle" />
          <p className="text-sm">{t('course:classType.subscription')}</p>
        </div>
      )
    case ClassType.appointment:
      return (
        <div className="box-row-full justify-start">
          <FaUserClock className="text-[#F87575]" />
          <p className="text-sm">{t('course:classType.appointment')}</p>
        </div>
      )
    case ClassType.regularV2:
      return (
        <div className="box-row-full justify-start">
          <LucideBookOpen className="text-primary" />
          <p className="text-sm">{t('course:classType.regularV2')}</p>
        </div>
      )
    default:
      return <></>
  }
}
