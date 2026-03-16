import { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'
import { FaChevronRight } from 'react-icons/fa'

import useSchoolData from '../../hooks/useSchoolData'
import useSiteData from '../../hooks/useSiteData'
import { Button } from '../ui/Button'

type ViewSiteButtonProps = {
  align?: string
} & ComponentProps<typeof Button>

const ViewSiteButton = ({
  align,
  ...props
}: ViewSiteButtonProps): JSX.Element => {
  const { t } = useTranslation()
  const { siteData } = useSiteData()
  const { schoolData } = useSchoolData()
  const domain = siteData.currentSite?.url
  const schoolUrl = schoolData.currentSchool?.url

  const customDomain = siteData.currentSite?.customDomain

  const isDev = import.meta.env.DEV
  const webBaseUrl =
    import.meta.env.VITE_WEB_BASE_URL || 'http://localhost:3001'

  let customLink: string
  if (isDev) {
    customLink = webBaseUrl
  } else {
    customLink = `https://${
      customDomain && customDomain !== '' ? customDomain : domain
    }`
  }
  if (schoolUrl) {
    customLink += `/@${encodeURI(schoolUrl)}`
  }

  return (
    <Button
      onClick={() => {
        window.open(customLink, '_blank')
      }}
      variant="primary-outline"
      iconAfter={<FaChevronRight />}
      {...props}
    >
      {t('school:headings.viewSite')}
    </Button>
  )
}

export default ViewSiteButton
