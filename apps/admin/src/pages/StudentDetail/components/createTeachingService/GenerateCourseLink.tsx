import { t } from 'i18next'

import Box from '@/components/Containers/Box'
import { Spinner } from '@/components/Loaders/Spinner'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'
import { AddTeachingServiceMode } from '@/stores/studentData'
import { FormTeachingServiceProps } from '@/types/studentAddTeachingService'

import FormTeachingService from './FormTeachingService'
import { InputFields, Loading } from '.'

type Props = FormTeachingServiceProps & {
  headerBackButton: HeaderBackButtonStatus
  onSubmitGenerateTeachingServiceLink: (data: InputFields) => void
  isGenerating: boolean
}

const GenerateCourseLink = (props: Props) => {
  const {
    headerBackButton,
    form,
    onSubmitGenerateTeachingServiceLink,
    isGenerating,
  } = props

  const { handleSubmit } = form

  const rightHeaderContent = () => {
    return (
      <Button onClick={handleSubmit(onSubmitGenerateTeachingServiceLink)}>
        {t('student:generateBtn')}
        {isGenerating && (
          <Loading>
            <Spinner size="small" />
          </Loading>
        )}
      </Button>
    )
  }

  return (
    <form style={{ width: '100%' }} data-testid="teaching-service-form">
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:teachingService.teachingService')}
          </Heading>
        }
        rightHeader={rightHeaderContent()}
      >
        <Box direction="column" css={{ paddingTop: '$4' }}>
          <FormTeachingService
            {...props}
            mode={AddTeachingServiceMode.generateCourseLink}
          />
        </Box>
      </ContentLayout>
    </form>
  )
}

export default GenerateCourseLink
