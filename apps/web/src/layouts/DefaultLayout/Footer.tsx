import moment from 'moment-timezone'
import useTranslation from 'next-translate/useTranslation'
import { SocialIcon } from 'react-social-icons'

import Box from '@/components/Containters/Box'
import ImageWithFallback from '@/components/Images/ImageWithFallback'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import useResponsive from '@/hooks/useResponsive'
import { School, Site } from '@/types'

import { ContactInfos, ContactInfoType } from '../HeroTemplateLayout/HeroFooter'

const footer_logo = '/images/logos/flowclass_icon.png'

interface ServiceDetailFooterProps {
  school: School
  site: Site
}

const ServiceDetailFooter = ({ school, site }: ServiceDetailFooterProps): JSX.Element => {
  const { t } = useTranslation('footer')
  const hasContact = school.address || school.phone || school.email
  const phone = school.phone
  const { isSafari } = useResponsive()
  const { currency, timeZone, socialMedia } = site
  const utcOffset = moment.tz(timeZone.id).format('Z')

  return (
    <footer className="bg-backgroundLayer2 p-4 pb-20 pt-4 lg:pb-0 lg:pt-8">
      <Box direction="col" padding="lg">
        {currency && (
          <Text className="text-center">
            {t('component:footer.currency')} <span style={{ fontWeight: 'bold' }}>{currency}</span>
          </Text>
        )}
        {timeZone && (
          <Text className="text-center">
            {t('component:footer.timeZone')}{' '}
            <span style={{ fontWeight: 'bold' }}>{`${timeZone.id} (UTC${utcOffset})`}</span>
          </Text>
        )}

        {hasContact && (
          <Heading align="center" className="mt-12">
            {t('component:footer.contactUs')}
          </Heading>
        )}
        {school.address && (
          <ContactInfos site={site} school={school} type={ContactInfoType.ADDRESS} />
        )}
        {school.phone && <ContactInfos site={site} school={school} type={ContactInfoType.PHONE} />}
        {school.email && <ContactInfos site={site} school={school} type={ContactInfoType.EMAIL} />}
        {socialMedia && (
          <div className="flex flex-row gap-3">
            {socialMedia.map(s => {
              return (
                <div key={s.id}>
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
                    <SocialIcon network={s.name} style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex-end mt-12">
          <LanguageToggle className="justify-end" />
        </div>
        <Box justify="between" responsive>
          <Text align="center">{`${t(`component:footer.copyright`)} ${moment().year()} by ${
            school.name
          }`}</Text>
          <a href="https://flowclass.io">
            <Box>
              <ImageWithFallback src={footer_logo} className="h-6 w-6" alt="Powered by Flowclass" />
              <Text className="text-sm">{t('component:footer.slogan')}</Text>
            </Box>
          </a>
        </Box>
      </Box>
    </footer>
  )
}

export default ServiceDetailFooter
