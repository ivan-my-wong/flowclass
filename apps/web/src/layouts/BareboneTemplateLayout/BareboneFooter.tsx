import moment from 'moment-timezone'
import useTranslation from 'next-translate/useTranslation'
import { SocialIcon } from 'react-social-icons'

import Text from '@/components/Texts/Text'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import useResponsive from '@/hooks/useResponsive'
import StudentProfile from '@/page-components/profile/StudentProfile'
import { School, Site } from '@/types'

import { ContactInfos, ContactInfoType } from '../HeroTemplateLayout/HeroFooter'

const footer_logo = '/images/logos/flowclass_icon.png'

interface BareboneFooterProps {
  school: School
  site: Site
}

const BareboneFooter = ({ school, site }: BareboneFooterProps): JSX.Element => {
  const { t } = useTranslation('footer')

  const { isSafari } = useResponsive()
  const { currency, timeZone, socialMedia } = site
  const utcOffset = moment.tz(timeZone.id).format('Z')

  return (
    <footer className="border-background-layer-3 container mx-auto rounded-lg border bg-white p-2">
      <div className="box-responsive items-start justify-between">
        <div className="box-col-full items-center md:items-start">
          <StudentProfile school={school} />
          {currency && (
            <p className="text-sm md:text-left">
              {t('component:footer.currency')} <span className="font-bold">{currency}</span>
            </p>
          )}
          {timeZone && (
            <p className="text-center text-sm md:text-left">
              {t('component:footer.timeZone')}{' '}
              <span className="font-bold">{`${timeZone.id} (UTC${utcOffset})`}</span>
            </p>
          )}

          <LanguageToggle className="md:justify-start" />
        </div>

        <div className="box-col-full items-center md:items-start">
          {school.address && (
            <ContactInfos
              site={site}
              school={school}
              type={ContactInfoType.ADDRESS}
              textStyles="text-center md:text-right md:!items-end"
              boxClassName="justify-center md:justify-end"
            />
          )}
          {school.phone && (
            <ContactInfos
              site={site}
              school={school}
              type={ContactInfoType.PHONE}
              textStyles="text-center md:text-right"
              boxClassName="justify-center md:justify-end"
            />
          )}
          {school.email && (
            <ContactInfos
              site={site}
              school={school}
              type={ContactInfoType.EMAIL}
              textStyles="text-center md:text-right"
              boxClassName="justify-center md:justify-end"
            />
          )}
        </div>
        {socialMedia && (
          <div className="mt-2 flex items-start">
            {socialMedia.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  if (isSafari) {
                    window.location.href = s.link
                  } else {
                    window.open(s.link, '_blank')
                  }
                }}
                className="mx-1"
              >
                <SocialIcon network={s.name} style={{ width: '20px', height: '20px' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="box-responsive items-start justify-between md:items-center">
        <Text className="text-sm">{`${t(`component:footer.copyright`)} ${moment().year()} by ${
          school.name
        }`}</Text>
        {/* <a href="https://flowclass.io" className="flex items-center">
          <ImageWithFallback
            src={footer_logo}
            className="mr-1 h-4 w-4"
            alt="Powered by Flowclass"
          />
          <Text className="text-xs">{t('component:footer.slogan')}</Text>
        </a> */}
      </div>
    </footer>
  )
}

export default BareboneFooter
