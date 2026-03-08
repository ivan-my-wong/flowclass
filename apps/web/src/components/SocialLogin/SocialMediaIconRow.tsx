import useTranslation from 'next-translate/useTranslation'
import { SocialIcon } from 'react-social-icons'

import useResponsive from '@/hooks/useResponsive'
import { SocialMediaSetting } from '@/types'

const SocialMediaIconRow = ({
  socialMedia,
  size = 'medium',
}: {
  socialMedia: SocialMediaSetting[]
  size?: 'small' | 'medium' | 'large'
}): JSX.Element => {
  const { t } = useTranslation()
  const { isSafari } = useResponsive()
  let iconSize = '1.5rem'
  if (size === 'medium') {
    iconSize = '1.5rem'
  } else if (size === 'large') {
    iconSize = '2rem'
  } else if (size === 'small') {
    iconSize = '1rem'
  }

  if (socialMedia && socialMedia.length > 0) {
    return (
      <div className="box-row-full gap-4">
        {socialMedia.map(s => {
          return (
            <div key={s.id}>
              <button
                data-testid={`link-${s.name?.toLowerCase()}`}
                onClick={() => {
                  if (isSafari) {
                    // Safari-specific code
                    window.location.href = s.link
                  } else {
                    window.open(s.link, '_blank')
                  }
                }}
              >
                <SocialIcon network={s.name} style={{ width: iconSize, height: iconSize }} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return <></>
}

export default SocialMediaIconRow
