import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import useTranslation from 'next-translate/useTranslation'

const icon = '/images/logos/new_flowclass_icon.png'

const ErrorPage: NextPage = () => {
  const router = useRouter()
  const { t } = useTranslation()

  const backToPreviousPage = () => {
    router.back()
  }
  return (
    <div className="flex h-dvh w-screen flex-col items-center justify-center gap-4 bg-gray-100 p-2">
      <Image src={icon} width={500} height={100} alt="Flowclass Logo" />
      <p className="text-center">{t('common:notFound.genericError')}</p>
      <button
        onClick={backToPreviousPage}
        className="bg-background text-primary-subtle flex cursor-pointer rounded border px-4 py-2 shadow"
      >
        {t('common:notFound.back')}
      </button>
    </div>
  )
}

export default ErrorPage
