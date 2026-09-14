import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuLayers, LuMessageSquare } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import ContentLayout from '@/layouts/ContentLayout'
import ListWhatsappTemplate from '@/pages/WhatsappTemplate/components/ListWhatsappTemplate'

import ListCustomMessages from './components/ListCustomMessages'

const CustomMessages = (): JSX.Element => {
  const { t } = useTranslation(['customMessage', 'whatsappTemplate'])
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'custom-messages'

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  return (
    <>
      <ContentLayout
        leftHeader={
          <Heading>
            {activeTab === 'whatsapp-templates'
              ? t('whatsappTemplate:whatsappTemplate')
              : t('customMessage:customMessage.title')}
          </Heading>
        }
        rightHeader={
          activeTab === 'whatsapp-templates' ? (
            <Button
              onClick={() => {
                navigate(
                  '/custom-messages/whatsapp-templates/add?tab=whatsapp-templates'
                )
              }}
            >
              + {t('whatsappTemplate:addWhatsappTemplate')}
            </Button>
          ) : undefined
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger
              value="custom-messages"
              className="flex items-center gap-2"
            >
              <LuLayers className="w-4 h-4" />
              {t('customMessage:customMessage.title')}
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp-templates"
              className="flex items-center gap-2"
            >
              <LuMessageSquare className="w-4 h-4" />
              {t('whatsappTemplate:whatsappTemplate')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom-messages">
            <ListCustomMessages />
          </TabsContent>
          <TabsContent value="whatsapp-templates">
            <ListWhatsappTemplate />
          </TabsContent>
        </Tabs>
      </ContentLayout>

      <Outlet />
    </>
  )
}
export default CustomMessages
