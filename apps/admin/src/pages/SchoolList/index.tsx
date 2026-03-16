import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import AddSchoolModal from '@/pages/School/CreateSchoolModal'
import { siteState } from '@/stores/siteData'

import SchoolCard from './SchoolCard'

const rightHeaderContent = (
  <Box>
    <AddSchoolModal />
    {/* <DuplicateSchoolModal /> */}
  </Box>
)

const SchoolList = (): JSX.Element => {
  const { schoolData, useFetchAllSchoolData } = useSchoolData()
  const fetchSchoolDataResult = useFetchAllSchoolData()
  const { t } = useTranslation()
  const { isLoading, isError, isSuccess, isIdle } = fetchSchoolDataResult
  const { currentSite } = useRecoilValue(siteState)

  // const headerBackButton: HeaderBackButtonStatus = {
  //   title: t(`component:menubar.siteSettings`),
  //   // subtitle: t(`component:menubar.schoolList`) as string,
  //   mode: 'add',
  // }
  const [defaultSchoolId, setDefaultSchoolId] = useState<number | null>(
    currentSite?.defaultInstitutionId ?? null
  )

  const schoolCardList = schoolData.schools.map(school => (
    <SchoolCard
      key={school.id}
      id={school.id}
      name={school.name}
      url={school.url}
      logo={school.logo}
      bannerImage={school.bannerImage}
      isDefault={school.id === defaultSchoolId}
      onSetDefault={() => setDefaultSchoolId(school.id)}
    />
  ))

  return (
    <ContentLayout rightHeader={rightHeaderContent}>
      {isIdle && <FullScreenAlertBox text={t(`school:noSite`)} />}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && schoolCardList.length === 0 && (
        <FullScreenAlertBox
          text={t(`school:noSchool`)}
          content={<AddSchoolModal />}
        />
      )}
      {isSuccess && schoolCardList.length > 0 && (
        <Box direction="column" className="w-full p-4 gap-4">
          {schoolCardList}
        </Box>
      )}
    </ContentLayout>
  )
}

export default SchoolList
