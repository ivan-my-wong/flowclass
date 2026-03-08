import { useMemo, useState } from 'react'

import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import DatePicker from 'react-datepicker'
import Select from 'react-select'

import Button from '@/components/Buttons/Button'
import { ExampleCustomInput } from '@/components/Inputs/DatePicker'
import { useAuth } from '@/stores/auth'
import { Course } from '@/types'
import { FilterPaymentReports } from '@/types/profile'
import { getValueFromOptions } from '@/utils/profile'

type FilterFormProps = {
  courses: Course[]
  currentFilter?: FilterPaymentReports
  setCurrentFilter: (filter?: FilterPaymentReports) => void
  showPaymentState?: boolean
}

const FilterForm = ({ courses, setCurrentFilter, showPaymentState }: FilterFormProps) => {
  const { t } = useTranslation()
  const { auth } = useAuth()

  const [filter, setFilter] = useState<FilterPaymentReports>()

  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [paymentDate, setPaymentDate] = useState('')

  const handleChangeDate = (dates: (Date | null)[]) => {
    const [start, end] = dates
    setStartDate(start && dayjs(start).startOf('day').toDate())
    setEndDate(end && dayjs(end).endOf('day').toDate())

    if (!start || !end) {
      setPaymentDate('')
    } else {
      setPaymentDate(`${start?.toLocaleDateString()} - ${end?.toLocaleDateString()}`)
    }
  }

  const handleChange = (field: string, value?: string | number) => {
    setFilter(prev => ({ ...(prev ?? ({} as FilterPaymentReports)), [field]: value }))
  }

  const optionsChildren = useMemo(
    () =>
      [
        auth?.userAliasId
          ? { label: auth?.firstName || t('profile:account.myAccount'), value: auth.userAliasId }
          : null,
        ...(auth?.listChildren?.map(child =>
          child?.userAliasId
            ? { label: child?.firstName || t('profile:studentName'), value: child.userAliasId }
            : null
        ) ?? []),
      ].filter(Boolean) as { label: string; value: number }[],
    [auth?.firstName, auth?.userAliasId, auth?.listChildren, t]
  )

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
      <DatePicker
        data-testid="date-picker"
        selectsRange
        isClearable
        customInput={
          <ExampleCustomInput
            type={'begin'}
            className="raw-input rounded-md border-gray-200 py-[6px]"
            fieldName="payment-date"
            placeholder={t('profile:paymentDate')}
            readOnly
          />
        }
        dateFormat="yyyy/MM/dd"
        className="custom-datepicker"
        selected={startDate}
        onChange={handleChangeDate}
        startDate={startDate}
        endDate={endDate}
        value={paymentDate}
        placeholderText={t('profile:paymentDate')}
      />
      <Select
        data-testid="course-select"
        options={courses?.map(course => ({ label: course.name, value: course.id })) || []}
        placeholder={t('profile:course')}
        onChange={val => handleChange('courseId', val?.value)}
        isClearable
        isSearchable
        name="course"
        value={getValueFromOptions(courses, filter?.courseId)}
      />
      {/* {showPaymentState && (
        <Select
          data-testid="payment-status-select"
          options={optionsPaymentState}
          placeholder={t('profile:paymentStatus')}
          onChange={val => handleChange('paymentState', val?.value)}
          isClearable
          isSearchable
          name="payment-status"
          value={getValueFromOptions(optionsPaymentState, filter?.paymentState)}
        />
      )} */}
      {/* <Select
        data-testid="payment-method-select"
        options={optionsPaymentMethod}
        placeholder={t('profile:paymentMethod')}
        onChange={val => handleChange('paymentMethod', val?.value)}
        isClearable
        isSearchable
        name="payment-method"
        value={getValueFromOptions(optionsPaymentMethod, filter?.paymentMethod)}
      /> */}
      {!!auth?.listChildren?.length && (
        <Select
          data-testid="children-select"
          options={optionsChildren}
          placeholder={t('profile:children')}
          onChange={val => handleChange('childrenId', val?.value)}
          isClearable
          isSearchable
          name="childrenId"
          value={getValueFromOptions(optionsChildren, filter?.childrenId)}
        />
      )}
      <div className="flex gap-3">
        <Button
          data-testid="filter-btn"
          className="w-full"
          onClick={() => {
            setCurrentFilter({
              ...(filter ?? ({} as FilterPaymentReports)),
              startDate: startDate?.toISOString() ?? undefined,
              endDate: endDate?.toISOString() ?? undefined,
            })
          }}
        >
          {t('profile:filter')}
        </Button>
        <Button
          data-testid="reset-btn"
          className="w-full"
          variant="outlined"
          onClick={() => {
            setFilter(undefined)
            setCurrentFilter(undefined)
            handleChangeDate([null, null])
          }}
        >
          {t('profile:reset')}
        </Button>
      </div>
    </div>
  )
}

export default FilterForm
