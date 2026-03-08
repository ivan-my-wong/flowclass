import moment from 'moment-timezone'
import useTranslation from 'next-translate/useTranslation'
import { BsTelephoneFill } from 'react-icons/bs'
import { MdEmail, MdLocationOn } from 'react-icons/md'

import Box from '@/components/Containters/Box'
import { contactMethodIcon } from '@/components/Icon/ContactMethodIcon'
import ImageWithFallback from '@/components/Images/ImageWithFallback'
import SocialMediaIconRow from '@/components/SocialLogin/SocialMediaIconRow'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import { PhoneContactMethod, School, Site } from '@/types'
import { cn } from '@/utils/cn'
import { getContactMethodLink } from '@/utils/contact'
import { nonFalsyJoin } from '@/utils/flatten'
import { formatPhoneNumber } from '@/utils/format'

const footer_logo = '/images/logos/flowclass_icon.png'

interface ServiceDetailFooterProps {
  school: School
  site: Site
}

export enum ContactInfoType {
  PHONE = 'phone',
  EMAIL = 'email',
  ADDRESS = 'address',
}

export const ContactInfos = ({
  site,
  type,
  school,
  textStyles,
  boxClassName,
}: {
  site: Site
  type: string
  school: School
  textStyles?: string
  boxClassName?: string
}): JSX.Element => {
  const { t } = useTranslation()
  const address = school.address

  switch (type) {
    case ContactInfoType.PHONE:
      return (
        <div
          className={cn(
            'box-row-full',
            school.phoneContactMethod !== null ? 'cursor-pointer' : '',
            boxClassName
          )}
          onClick={() => {
            if (school.phone !== null && school.phone !== '') {
              const url = getContactMethodLink({
                contactId: school?.contactId,
                contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
                phone: school.phone ?? '',
                schoolUrl: school?.url ?? '',
                domain: site.url,
              })

              if (url !== '') window.open(url, '_blank')
            }
          }}
        >
          {school.phoneContactMethod ? (
            contactMethodIcon(school.phoneContactMethod)
          ) : (
            <BsTelephoneFill />
          )}

          <Text className={textStyles ?? ''}>{formatPhoneNumber(`+${school.phone}`)}</Text>
        </div>
      )
    case ContactInfoType.EMAIL:
      return (
        <div className={cn('box-row-full', boxClassName)}>
          <MdEmail />
          <Text className={textStyles ?? ''}>{school.email}</Text>
        </div>
      )
    case ContactInfoType.ADDRESS:
      return (
        <div className={cn('box-row-full items-start', boxClassName)}>
          <MdLocationOn style={{ flexShrink: 0, marginTop: '4px' }} />
          {address ? (
            <div className={`flex flex-col md:items-center ${textStyles ?? ''}`}>
              {address.addressLine1 && <p className="text-center">{address.addressLine1},</p>}
              {address.addressLine2 && <p className="text-center">{address.addressLine2},</p>}
              <p className="text-center">
                {nonFalsyJoin([address.area, address.state, site?.country])}
              </p>
            </div>
          ) : (
            <Text>{t('component:footer.online')}</Text>
          )}
        </div>
      )
  }
  return <></>
}

const HeroFooter = ({ school, site }: ServiceDetailFooterProps): JSX.Element => {
  const { t } = useTranslation()
  const hasContact = school.address || school.phone || school.email
  const { currency, timeZone } = site

  const socialMedia = school.institutionSetting?.socialMedia

  const utcOffset = moment.tz(timeZone.id).format('Z')

  return (
    <footer className="bg-background box-col-full p-4 pb-20 pt-4 lg:pt-8">
      <Box direction="col" padding="lg" className="max-w-7xl">
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

        {socialMedia && socialMedia.length > 0 && (
          <div className="box-col-full mb-8 gap-2">
            <Heading align="center" className="mt-8">
              {t('component:footer.socialMedia')}
            </Heading>
            <SocialMediaIconRow socialMedia={socialMedia} />
          </div>
        )}
        <div className="my-2" />
        <LanguageToggle />
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

export default HeroFooter
