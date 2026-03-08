import useTranslation from 'next-translate/useTranslation'
import { SocialIcon } from 'react-social-icons'

import SocialShareButtons from '@/components/SocialLogin/SocialShareButtons'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import useResponsive from '@/hooks/useResponsive'
import { ContactInfos, ContactInfoType } from '@/layouts/HeroTemplateLayout/HeroFooter'
import { useSchoolContext } from '@/stores/schoolContext'

const whiteShadowBox =
  'box-col-full border-textDisabled bg-background rounded p-4 shadow-sm lg:w-1/2 gap-6'

const HeroContactTab = (): JSX.Element => {
  const { schoolContext } = useSchoolContext()
  const { school, baseUrl, site } = schoolContext
  const { isSafari } = useResponsive()
  const socialMedia = school?.institutionSetting?.socialMedia

  const { t } = useTranslation()

  if (!school || !site) {
    return (
      <div id="contact" className="flex h-full w-full flex-col items-center justify-center">
        {t('school:contact.noContactInfo')}
      </div>
    )
  }

  return (
    <div id="contact" className="flex h-full w-full flex-col items-center justify-center">
      <div className="box-col my-8 min-h-[20rem]">
        <Heading align="center">{t('school:heading.contact')}</Heading>
        <Text align="center">{t('school:contact.description')}</Text>
        <div className={whiteShadowBox}>
          {school.address && (
            <ContactInfos site={site} school={school} type={ContactInfoType.ADDRESS} />
          )}
          {school.phone && (
            <ContactInfos site={site} school={school} type={ContactInfoType.PHONE} />
          )}
          {school.email && (
            <ContactInfos site={site} school={school} type={ContactInfoType.EMAIL} />
          )}
        </div>
        {socialMedia && socialMedia.length > 0 && (
          <div className="box-col-full gap-2">
            <Heading align="center" className="mt-8">
              {t('component:footer.socialMedia')}
            </Heading>

            <div className={whiteShadowBox}>
              {socialMedia.map(s => {
                return (
                  <div key={s.id} className="box-responsive-full gap-4">
                    <button
                      onClick={() => {
                        if (isSafari) {
                          // Safari-specific code
                          window.location.href = s.link
                        } else {
                          window.open(s.link, '_blank')
                        }
                      }}
                    >
                      <SocialIcon network={s.name} style={{ width: '1.5rem', height: '1.5rem' }} />
                    </button>
                    <a href={s.link} className="text-wrap">
                      {s.link}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {baseUrl && <SocialShareButtons baseUrl={baseUrl} />}
      </div>
    </div>
  )
}

export default HeroContactTab
