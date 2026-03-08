import useTranslation from 'next-translate/useTranslation'

import { useSchoolContext } from '@/stores/schoolContext'
import { useSsrComplected } from '@/stores/ssrCompleted'
import { School } from '@/types'

import { ContactInfos, ContactInfoType } from '../HeroTemplateLayout/HeroFooter'

const SchoolContactInfo = ({
  backgroundColor = 'bg-background',
  school,
}: {
  backgroundColor?: string
  school: School
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  const { t } = useTranslation()
  const { schoolContext } = useSchoolContext()
  const { site } = schoolContext

  // const queryTab = useCurrentTab(tabs)
  if (!site) {
    return <></>
  }

  return (
    <>
      <div
        className={`${backgroundColor} align-center flex h-full w-full flex-col items-center justify-center gap-6`}
      >
        {school.address && (
          <ContactInfos
            site={site}
            school={school}
            type={ContactInfoType.ADDRESS}
            textStyles="w-full"
            boxClassName="w-fit"
          />
        )}
        {school.phone && (
          <ContactInfos
            site={site}
            school={school}
            type={ContactInfoType.PHONE}
            textStyles="w-full"
            boxClassName="w-fit"
          />
        )}
        {school.email && (
          <ContactInfos
            site={site}
            school={school}
            type={ContactInfoType.EMAIL}
            textStyles="w-full"
            boxClassName="w-fit"
          />
        )}
      </div>
    </>
  )
}

export default SchoolContactInfo
