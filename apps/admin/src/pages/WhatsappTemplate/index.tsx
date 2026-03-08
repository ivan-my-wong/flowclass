import { Outlet, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'

import ListWhatsappTemplate from './components/ListWhatsappTemplate'

const WhatsappTemplate = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <ContentLayout
        leftHeader={<Heading>{t('whatsappTemplate:whatsappTemplate')}</Heading>}
        rightHeader={
          <Button
            onClick={() => {
              navigate('/whatsapp-templates/add')
            }}
          >
            + {t('whatsappTemplate:addWhatsappTemplate')}
          </Button>
        }
      >
        <ListWhatsappTemplate />
      </ContentLayout>

      <Outlet />
    </>
  )
}
export default WhatsappTemplate
