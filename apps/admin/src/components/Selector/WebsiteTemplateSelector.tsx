import { useTranslation } from 'react-i18next'

import { WebsiteTemplate } from '../../constants/websiteTemplate'

import Select from './Select'

export type WebsiteTemplateSelectorProps = {
  selectedWebsiteTemplate: WebsiteTemplate
  setSelectedWebsiteTemplate: (value: any) => void
}

const WebsiteTemplateSelector: React.FC<WebsiteTemplateSelectorProps> = ({
  selectedWebsiteTemplate,
  setSelectedWebsiteTemplate,
}) => {
  const { t } = useTranslation()

  if (!selectedWebsiteTemplate) return <></>

  return (
    <>
      <Select
        fullWidth
        placeholder={selectedWebsiteTemplate}
        selectItems={[
          {
            itemValues: [
              {
                value: WebsiteTemplate.Barebone,
                label: t(
                  'setting:webpageSetting.availableTemplates.barebone'
                ) as string,
              },
              {
                value: WebsiteTemplate.Minimal,
                label: t(
                  'setting:webpageSetting.availableTemplates.minimal'
                ) as string,
              },
              {
                value: WebsiteTemplate.Vertical,
                label: t(
                  'setting:webpageSetting.availableTemplates.vertical'
                ) as string,
              },
              {
                value: WebsiteTemplate.Hero,
                label: t(
                  'setting:webpageSetting.availableTemplates.hero'
                ) as string,
              },
            ],
          },
        ]}
        currentSelect={selectedWebsiteTemplate}
        onValueChange={setSelectedWebsiteTemplate}
      />
    </>
  )
}

export default WebsiteTemplateSelector
