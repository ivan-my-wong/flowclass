import router from 'next/router'

import useTranslation from 'next-translate/useTranslation'
import { IoMdAlert } from 'react-icons/io'
import { MdPerson3 } from 'react-icons/md'

import { useGlobalError } from '@/hooks/useGlobalError'
import { Course, School } from '@/types'

import Button from '../Buttons/Button'

import Modal from './Modal'

export type ErrorStatus = {
  isError: boolean
  message: string
  statusCode: string
}
type ErrorModalProps = {
  domain: string | undefined
  school: School | undefined
  course: Course | undefined
}
const ErrorModal = ({ domain, school, course }: ErrorModalProps): JSX.Element => {
  const { t } = useTranslation()
  const { errorState, setError } = useGlobalError()
  return (
    <Modal
      show={errorState.isError}
      onOpenChange={() => setError({ ...errorState, isError: false })}
      contentClassName="box-row border-warn  mt-10 flex flex-col rounded border border-l-8"
    >
      <Modal.Title className=" mt-10 flex justify-center self-center  text-base font-bold ">
        <IoMdAlert className="text-warn mr-4 self-center text-4xl" />
        <div className="flex flex-col gap-2">
          <div>{t('errors:ENROL.REGISTRATION_ERROR')}</div>
          <div className="text-warn font-normal">{errorState.message}</div>
          <div>{t('errors:ENROL.CONTACT_SUPPORT')}</div>
        </div>
      </Modal.Title>
      <Button
        variant="textPrimary"
        className=" mx-auto my-10 flex cursor-pointer flex-row items-center  text-2xl"
        onClick={() => {
          router.push({
            pathname: `https://api.whatsapp.com/send/`,
            query: {
              phone: '85257225763',
              text: `I need technical support on ${domain}/@${school?.url ?? ''}/${
                course?.path
              } ,errorMessage is \`${errorState.message ?? null}\` and statusCode is \`${
                errorState.statusCode
              }\``,
            },
          })
        }}
      >
        <MdPerson3 />
        <div className=" px-2">{t('course:technicalSupport')}</div>
      </Button>
    </Modal>
  )
}

export default ErrorModal
