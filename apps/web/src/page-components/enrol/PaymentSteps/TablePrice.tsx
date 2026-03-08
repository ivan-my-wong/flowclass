import useTranslation from 'next-translate/useTranslation'

import { getPriceWithCurrency } from '@/utils/string.utils'

type Props = {
  header: string
  label: string
  price: number
  currency: string
}
const TablePrice = ({ header, label, price, currency }: Props): JSX.Element => {
  const { t } = useTranslation()
  return (
    <table className="w-full table-auto border-collapse border">
      <thead>
        <tr className="bg-background-layer-3">
          <th className="border-borderColor border p-3" colSpan={2}>
            {header}
          </th>
          <th className="border-borderColor border p-3">{t('common:fields.price')}</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="border-borderColor border p-3 text-left" colSpan={2}>
            {label}
          </td>
          <td className="border-borderColor w-72 border p-3 text-center">
            {`+ ${getPriceWithCurrency(currency, price)}`}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default TablePrice
