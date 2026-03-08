import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import Popover from '@/components/Tooltips/Popover'
import { PaymentReports } from '@/types/profile'

const ViewApplicationForm = ({ data }: { data?: PaymentReports }) => {
  const { t } = useTranslation()

  return (
    <Popover
      trigger={
        <div>
          <Button className="w-full lg:w-fit" variant="outlined">
            {t('profile:viewApplicationForm')}
          </Button>
        </div>
      }
    >
      <div className="-m-5 bg-[#fff] p-3">
        <table className="w-[350px] border text-sm">
          <tbody>
            <tr className="border-b">
              <td className="w-[140px] border-r p-2">{t('profile:email')}</td>
              <td className="p-2">{data?.user?.email}</td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2">{t('profile:phone')}</td>
              <td className="p-2">{data?.user?.phone}</td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2">{t('profile:name')}</td>
              <td className="p-2">{data?.user?.name}</td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2">{t('profile:studentId')}</td>
              <td className="p-2">{data?.user?.studentId ?? '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2">{t('profile:organization')}</td>
              <td className="p-2">{data?.user?.organization ?? '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2">{t('profile:requiredNumber')}</td>
              <td className="p-2">{data?.user?.id}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Popover>
  )
}

export default ViewApplicationForm
