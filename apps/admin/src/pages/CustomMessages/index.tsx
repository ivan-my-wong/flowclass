import { Outlet } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import Heading from '@/components/Texts/Heading'
import ContentLayout from '@/layouts/ContentLayout'

import ListCustomMessages from './components/ListCustomMessages'

const CustomMessages = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <>
      <ContentLayout
        leftHeader={<Heading>{t('customMessage:customMessage.title')}</Heading>}
      >
        <ListCustomMessages />
      </ContentLayout>

      <Outlet />
    </>
  )
}
export default CustomMessages
