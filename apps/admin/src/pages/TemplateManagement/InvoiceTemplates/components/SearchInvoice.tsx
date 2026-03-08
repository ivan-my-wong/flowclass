import React, { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

type Props = {
  search: string
  status: string
  onSearchChange: (val: string) => void
  onStatusChange: (val: string) => void
}
const SearchInvoice: React.FC<Props> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) => {
  const { t } = useTranslation()
  const statusOptions = useMemo(() => {
    return [
      { value: 'all', label: t('invoiceCampaign:documentStatus.allStatus') },
      { value: 'pending', label: t('invoiceCampaign:documentStatus.pending') },
      {
        value: 'sent',
        label: t('invoiceCampaign:documentStatus.sent'),
      },
      {
        value: 'failed',
        label: t('invoiceCampaign:documentStatus.failed'),
      },
      {
        value: 'completed',
        label: t('invoiceCampaign:documentStatus.completed'),
      },
    ]
  }, [t])
  return (
    <div className="box-row-full">
      {/* Search Box */}
      <div className="flex-1 flex items-center rounded-lg border border-gray-200 px-4 py-2">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t('invoiceCampaign:searchCampaigns').toString()}
          className="bg-transparent outline-none ml-2 w-full text-gray-500 placeholder-gray-400"
        />
      </div>

      {/* Status Dropdown */}
      <div className="min-w-[170px]">
        <select
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium focus:outline-none cursor-pointer w-full"
          value={status}
          onChange={e => onStatusChange(e.target.value)}
        >
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Export Button */}
      {/* <button
          type="button"
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-5 py-2 font-medium text-gray-900 hover:bg-gray-100 transition"
        >
          <LuDownload className="w-5 h-5" />
          Export CSV
        </button> */}
    </div>
  )
}
export default SearchInvoice
