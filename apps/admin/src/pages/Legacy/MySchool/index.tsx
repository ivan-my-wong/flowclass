import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getSchools } from '@/api/schoolManagment'
import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { QUERY_KEY } from '@/constants/queryKey'
import ContentLayout from '@/layouts/ContentLayout'
import AddSchoolModal from '@/pages/School/CreateSchoolModal'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { siteState } from '@/stores/siteData'
import { UserRole } from '@/stores/userPermissionData'
import { styled } from '@/styles'
import { School } from '@/types/school'

import SchoolCard from './components/SchoolCard'

const rightHeaderContent = (
  <Box>
    <AddSchoolModal />
  </Box>
)
const MySchool = () => {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(9)
  const [featchAgain, setFeatAgain] = useState<number>(1)
  const [listMySchool, setListMySchool] = useState<School[]>()
  const { currentSite } = useRecoilValue(siteState)

  const useFetchAllSchoolData = useQuery(
    [QUERY_KEY.site.getMySchoolKey],
    () =>
      getSchools({
        page: currentPage,
        limit,
        siteId: currentSite?.id || 0,
      }),
    {
      onSuccess: data => {
        if (listMySchool) {
          setListMySchool([...listMySchool, ...data])
        } else {
          setListMySchool(data)
        }
        return data
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      cacheTime: 0,
      enabled: !!currentPage && !!limit,
    }
  )

  const { isLoading, isError, isIdle, isSuccess, data, refetch } =
    useFetchAllSchoolData

  useEffect(() => {
    refetch()
    setListMySchool(undefined)
  }, [featchAgain, refetch, currentSite])
  useEffect(() => {
    refetch()
  }, [currentPage, refetch])

  const handleNext = () => {
    setCurrentPage(currentPage + 1)
  }
  const handleFeatchAgain = () => {
    setLimit(9 * currentPage)
    setCurrentPage(1)

    setFeatAgain(featchAgain + 1)
  }

  return (
    <ProtectedComponent roleAllowed={[UserRole.MasterAdmin]}>
      <ContentLayout
        leftHeader={
          <div style={{ fontSize: '24px', marginLeft: '16px' }}>
            {t('school:mySchool.mySchool')}
          </div>
        }
        rightHeader={rightHeaderContent}
      >
        {isIdle && <FullScreenAlertBox text={t(`teachingService:noSchool`)} />}
        {isLoading && <FullScreenLoading />}
        {isError && (
          <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
        )}
        {isSuccess && data && data.length === 0 && (
          <FullScreenAlertBox text={t(`school:noSchool`)} />
        )}
        {isSuccess && data && (
          <Box direction="column" css={{ padding: '$2 $12' }}>
            <ActionBoxContainer grid>
              {listMySchool &&
                listMySchool.map(el => {
                  return (
                    <ActionBoxWrapper key={el.id}>
                      <SchoolCard
                        data={el}
                        setFeatAgain={() => handleFeatchAgain()}
                      />
                    </ActionBoxWrapper>
                  )
                })}
            </ActionBoxContainer>
            {data.length >= 9 && (
              <Button onClick={handleNext}>
                {t(`school:mySchool.loadMore`)}
              </Button>
            )}
          </Box>
        )}
      </ContentLayout>
    </ProtectedComponent>
  )
}
const ActionBoxContainer = styled('div', {
  display: 'flex',
  width: '100%',
  marginBottom: '$5',
  flexDirection: 'row',
  '@sm': {
    flexDirection: 'column',
  },

  variants: {
    grid: {
      true: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridGap: '$4',
        '@sm': {
          gridTemplateColumns: 'repeat(1, 1fr)',
        },
      },
    },
  },
})

const ActionBoxWrapper = styled('div', {
  flexBasis: 'calc(33.333%)',
  background: '$backgroundLayer2',
  borderRadius: '$1',
  marginRight: '$5',
  height: 'auto',
  justifyContent: 'center',
  alignItems: 'center',
  '@sm': {
    marginBottom: '$2',
  },
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$backgroundLayer3',
  },

  variants: {
    disabled: {
      true: {
        filter: 'grayscale(100%)',
        opacity: 0.5,
        cursor: 'default',

        pointerEvents: 'none',
      },
    },
  },
})

export default MySchool
