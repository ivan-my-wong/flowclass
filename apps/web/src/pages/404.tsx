import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'

import useTranslation from 'next-translate/useTranslation'

import { DataErrorMessage, InstitutionErrorMessage } from '@/api/error/errorMessage'
import { getSupportWhatsAppLink } from '@/utils/contact'

const SchoolLayout = dynamic(() => import('@/layouts/MinimalTemplateLayout'), { ssr: false })
const icon = '/images/logos/new_flowclass_icon.png'

type NotFoundPageProps = {
  errorMessage?: string
}

const NotFoundPage: NextPage<NotFoundPageProps> = ({ errorMessage }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const generateMessage = () => {
    switch (errorMessage) {
      case InstitutionErrorMessage.INSTITUTION_NOT_FOUND:
        return t('common:notFound.INSTITUTION_NOT_FOUND')
      case InstitutionErrorMessage.INVALID_DOMAIN:
        return t('common:notFound.invalidDomain')
      case DataErrorMessage.DATA_NOT_FOUND:
        return t('common:notFound.dataNotFound')
      case DataErrorMessage.INVOICE_NOT_FOUND:
        return t('common:notFound.invoiceNotFound')
      case DataErrorMessage.COURSE_NOT_FOUND:
        return t('common:notFound.courseNotFound')
      default:
        return t('common:notFound.pageNotFound')
    }
  }
  return (
    <SchoolLayout tabs={[]} showHeader={true} showFooter={true}>
      <div className="flex h-dvh w-screen flex-col items-center justify-center gap-4 bg-gray-100 p-2">
        <Image src={icon} width={500} height={100} alt="Flowclass Logo" />
        <p className="text-center">{generateMessage()}</p>
        {[InstitutionErrorMessage.INSTITUTION_NOT_FOUND, DataErrorMessage.DATA_NOT_FOUND].includes(
          errorMessage as string
        ) ? (
          <button
            type="button"
            className="bg-background text-primary-subtle flex cursor-pointer rounded border px-4 py-2 shadow"
            onClick={() => {
              router.back()
            }}
          >
            {t('common:navigation.backToPreviousPage')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              window.open(getSupportWhatsAppLink(errorMessage ?? '', t), '_blank')
            }}
            className="bg-background text-primary-subtle flex cursor-pointer rounded border px-4 py-2 shadow"
          >
            {t('common:notFound.contactTechnicalSupport')}
          </button>
        )}
      </div>
    </SchoolLayout>
  )
}

export default NotFoundPage
