import { useRouter } from 'next/router'

import useTranslation from 'next-translate/useTranslation'
import { AiOutlineRight, AiTwotoneMail } from 'react-icons/ai'
import { MdPerson3 } from 'react-icons/md'

import { contactMethodIcon } from '@/components/Icon/ContactMethodIcon'
import { Course, PhoneContactMethod, School, Site } from '@/types'
import { getContactMethodLink } from '@/utils/contact'
import { formatPhoneNumber } from '@/utils/format'

const CourseEnquiryCard = ({
  course,
  school,
  site,
}: {
  course: Course
  school: School
  site: Site
}): JSX.Element => {
  const domain = site.url
  const phone = school.phone
  const email = school.email

  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="box-col-full gap-2 pt-2">
      <div className={`box-row justify-between pl-2 pt-2`}>
        <div className="flex flex-row items-center">
          <div className="justify-center">
            {contactMethodIcon(PhoneContactMethod.Phone)}
            {/*<IoLogoWhatsapp />*/}
          </div>
          <div className="lg:text-md pl-4 text-sm">
            {formatPhoneNumber(phone ?? '') !== ''
              ? formatPhoneNumber(phone ?? '')
              : t('course:courseEnquiryCard.noPhone')}
          </div>
        </div>

        <AiOutlineRight className="fill-primary flex-shrink-0 cursor-pointer" />
      </div>

      {school?.phoneContactMethod && (
        <div
          className={`whatsappLink box-row justify-between pl-2 pt-2 ${phone && 'cursor-pointer'}`}
          onClick={() => {
            if (phone !== null || phone !== '') {
              // open whatsapp in new tab because of whatsapp's network policy
              // safari tested ok

              window.open(
                getContactMethodLink({
                  contactId: school?.contactId,
                  contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
                  phone: phone ?? '',
                  schoolUrl: school?.url ?? '',
                  domain,
                  coursePath: course.path,
                }),
                '_blank'
              )
              // if (school.contactId) {
              //   if (school.phoneContactMethod === PhoneContactMethod.Line) {
              //     window.open(school.contactId, '_blank')
              //   }
              //   if (school.phoneContactMethod === PhoneContactMethod.Telegram) {
              //     window.open(`https://t.me/${school.contactId}`, '_blank')
              //   }
              //   if (school.phoneContactMethod === PhoneContactMethod.Signal) {
              //     window.open(`https://signal.me/#p/+${phone}`, '_blank')
              //   }
              // }
              //
              // window.open(
              //   `https://api.whatsapp.com/send/?phone=${phone}&text=From%20https://${domain}/@${
              //     school.url ?? ''
              //   }/${course.path}`,
              //   '_blank'
              // )
            }
          }}
        >
          <div className="flex flex-row items-center">
            <div className="justify-center">{contactMethodIcon(school?.phoneContactMethod)}</div>
            <div className="lg:text-md pl-4 text-sm">
              {school?.phoneContactMethod !== PhoneContactMethod.WhatsApp
                ? school.contactId
                : formatPhoneNumber(phone ?? '')}
            </div>
          </div>

          <AiOutlineRight className="fill-primary flex-shrink-0 cursor-pointer" />
        </div>
      )}

      {email && (
        <div className="box-row border-b-textDisabled cursor-pointer justify-between border-b pb-4 pl-2">
          <div className="flex flex-row items-center">
            <div className="justify-center">
              <AiTwotoneMail />
            </div>
            <div className="lg:text-md pl-4 text-sm">{email}</div>
          </div>

          <AiOutlineRight className="fill-primary flex-shrink-0 cursor-pointer" />
        </div>
      )}
      <div className="flex flex-row items-center justify-between text-xs">
        <div className="justify-center">
          <MdPerson3 />
        </div>
        <div
          className="cursor-pointer px-2"
          onClick={() => {
            router.push({
              pathname: `https://api.whatsapp.com/send/`,
              query: {
                phone: '85257225763',
                text: `I need technical support on ${domain}/@${school.url ?? ''}/${course.path} `,
              },
            })
          }}
        >
          {t('course:technicalSupport')}
        </div>
      </div>
    </div>
  )
}

export default CourseEnquiryCard
