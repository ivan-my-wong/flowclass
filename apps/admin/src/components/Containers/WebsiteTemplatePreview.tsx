import { useTranslation } from 'react-i18next'

import {
  WebsiteTemplate,
  WebsiteTemplatePreview,
} from '../../constants/websiteTemplate'
import ImageAspect from '../Images/ImageAspect'

import Box from './Box'

export type WebsiteTemplatePreviewProps = {
  selectedWebsiteTemplate: WebsiteTemplate
}

const WebsiteTemplatePreviewContainer: React.FC<
  WebsiteTemplatePreviewProps
> = ({ selectedWebsiteTemplate }) => {
  const { t } = useTranslation()

  if (
    !selectedWebsiteTemplate ||
    !WebsiteTemplatePreview[selectedWebsiteTemplate]
  )
    return <></>

  return (
    <div className="box-row-full">
      <p className="w-[60%] p-2">
        {t(
          `setting:webpageSetting.templateDescriptions.${selectedWebsiteTemplate}`
        )}
      </p>
      <div className="box-col-full w-[40%]">
        <ImageAspect
          src={WebsiteTemplatePreview[selectedWebsiteTemplate][0]}
          alt="Flowclass"
          width="100%"
          ratio={16 / 9}
          objectFit="contain"
        />
        {WebsiteTemplatePreview[selectedWebsiteTemplate][1] && (
          <Box direction="column">
            <p className="font-bold">
              {t(`setting:webpageSetting.mobileVersion`)}
            </p>
            <img
              src={WebsiteTemplatePreview[selectedWebsiteTemplate][1]}
              alt=""
            />
          </Box>
        )}
      </div>
    </div>
  )
}

export default WebsiteTemplatePreviewContainer
