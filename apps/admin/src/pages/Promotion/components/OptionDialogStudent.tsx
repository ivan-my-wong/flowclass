// eslint-disable-next-line no-restricted-syntax
import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuTrash2, LuUser } from 'react-icons/lu'

import Drawer from '@/components/Drawer/Drawer'
import { RadioItemProps } from '@/components/RadioGroup/RadioButtonGroup'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import usePromotionData from '@/hooks/usePromotionData'
import ContentLayout from '@/layouts/ContentLayout'
import { StudentProps } from '@/types/coupon'
import { cn } from '@/utils/cn'
import { formatPhoneNumber } from '@/utils/misc'

enum CouponStudentOptionSelect {
  ALL_STUDENTS = 'ALL_STUDENTS',
  SELECTED_STUDENTS = 'SELECTED_STUDENTS',
}

export type StudentOption = {
  label: string | null
  value: string | number
}

type OptionDialogProps = {
  open: boolean
  setOpen: () => void
  setFinalSelectedStudents: (value: StudentOption[]) => void
  // Update mode props
  isUpdateMode?: boolean
  couponId?: number
  // For create mode - pass existing students if any
  existingStudents?: StudentProps[]
}

export const mapStudentPropsToStudentOption = (
  student: StudentProps
): StudentOption => {
  return {
    label: [
      student.firstName,
      student.lastName,
      formatPhoneNumber(student.phone ?? ''),
      student.email,
    ]
      .filter(o => Boolean(o) && o !== '')
      .join(' / '),
    value: student.id,
  }
}

const OptionStudentDialog = ({
  open,
  setOpen,
  setFinalSelectedStudents,
  isUpdateMode = false,
  couponId,
  existingStudents = [],
}: OptionDialogProps): JSX.Element => {
  const { t } = useTranslation()

  const [optionSelect, setOptionSelect] = useState<String>(
    isUpdateMode
      ? CouponStudentOptionSelect.SELECTED_STUDENTS
      : CouponStudentOptionSelect.ALL_STUDENTS
  )
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([])
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Get hooks for API calls
  const { useUpdateCoupon, useFetchStudentData } = usePromotionData()
  const updateCoupon = useUpdateCoupon(couponId || 0)

  // Fetch student data when dialog is open
  const { data: listStudent = [] } = useFetchStudentData({
    disabled: !open,
    page: 1,
    limit: 0,
  })

  useEffect(() => {
    if (existingStudents.length > 0) {
      setSelectedStudents(
        existingStudents.map(student => mapStudentPropsToStudentOption(student))
      )
    }
  }, [existingStudents])

  // Filter out already selected students and apply search filter
  const optionStudents: StudentOption[] = useMemo(
    () =>
      listStudent
        .filter(student => !selectedStudents.some(s => s.value === student.id))
        .map((student: StudentProps) =>
          mapStudentPropsToStudentOption(student)
        ),
    [listStudent, selectedStudents]
  )

  const handleChangeOption = (value: String) => {
    setOptionSelect(value)
    setSelectedStudents([])
    setFinalSelectedStudents([])
  }

  const handleStudentSelect = (selectedValue: string) => {
    // Find the student from the available options
    const selectedStudent = optionStudents.find(
      student => student.value.toString() === selectedValue
    )

    if (
      selectedStudent &&
      !selectedStudents.some(s => s.value === selectedStudent.value)
    ) {
      const newSelectedStudents = [...selectedStudents, selectedStudent]
      setSelectedStudents(newSelectedStudents)
    }
  }

  const handleRemoveStudent = (studentToRemove: StudentOption) => {
    const newSelectedStudents = selectedStudents.filter(
      student => student.value !== studentToRemove.value
    )
    setSelectedStudents(newSelectedStudents)
    // Don't call actionSelectOption immediately - let it be handled on save
  }

  const handleSave = async () => {
    if (!isUpdateMode) {
      // In create mode, pass the selected students back to parent and close dialog
      setFinalSelectedStudents(selectedStudents)
      setOpen()
      return
    }

    if (!couponId) {
      setOpen()
      return
    }

    setIsSaving(true)
    try {
      // Update the coupon with new student list
      await updateCoupon.mutateAsync({
        userIds: selectedStudents.map(student => +student.value),
      })

      // Call success callback and close dialog
      setFinalSelectedStudents(selectedStudents)
      setOpen()
    } catch (error) {
      // Handle error silently or show toast
      // console.error('Failed to update coupon:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const radioOptions: RadioItemProps[] = [
    {
      value: CouponStudentOptionSelect.ALL_STUDENTS,
      label: t('promotion:studentOption1') as string,
    },

    {
      value: CouponStudentOptionSelect.SELECTED_STUDENTS,
      label: t('promotion:studentOption2') as string,
    },
  ]

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'back',
    action: () => setOpen(),
  }

  const leftHeaderContent = (
    <Heading size="smallMedium">{t('promotion:student')}</Heading>
  )

  const rightHeaderContent = (
    <div className="box-row-full">
      <Button variant="destructive-outline" onClick={() => setOpen()}>
        {t('common:action.cancel')}
      </Button>
      <Button onClick={handleSave} loading={isSaving} disabled={isSaving}>
        {t('promotion:save')}
      </Button>
    </div>
  )

  return (
    <Drawer open={open} onClose={setOpen}>
      <ContentLayout
        leftHeaderCSS="max-h-full"
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <div className="box-col-full py-6">
          <div className="box-col-full w-full border-b-text-disabled">
            {radioOptions.map(el => {
              return (
                <div
                  key={el.value as string}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'box-row-full p-2 rounded h-[70px] cursor-pointer',
                    optionSelect === el.value
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border-color text-text'
                  )}
                  onClick={() => handleChangeOption(el.value as string)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleChangeOption(el.value as string)
                    }
                  }}
                >
                  <Text
                    className={cn(
                      optionSelect === el.value ? 'font-bold' : 'font-normal'
                    )}
                  >
                    {el.label}
                  </Text>
                </div>
              )
            })}
          </div>

          {optionSelect === CouponStudentOptionSelect.SELECTED_STUDENTS && (
            <div className="box-col-full mb-[30vh]">
              <div className="box-col-full mb-4">
                <Combobox
                  options={optionStudents.map(student => ({
                    label: student.label || '',
                    value: student.value.toString(),
                  }))}
                  onValueChange={handleStudentSelect}
                  placeholder={
                    t('promotion:studentDialog.searchPlaceholder') as string
                  }
                  emptyText={
                    t('promotion:studentDialog.noStudentsFound') as string
                  }
                />
              </div>

              {/* Display currently selected students */}
              {selectedStudents.length > 0 && (
                <div className="box-col-full w-full">
                  <div className="box-row-full w-full items-center justify-between mb-4">
                    <div className="box-row-full justify-start items-center gap-2">
                      <Text className="font-bold text-lg">
                        {
                          t(
                            'promotion:studentDialog.eligibleStudents'
                          ) as string
                        }
                      </Text>
                      <h3 className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                        {selectedStudents.length}{' '}
                        {t('promotion:studentDialog.selectedCount') as string}
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                      disabled={selectedStudents.length === 0}
                      className="text-gray-600"
                    >
                      {t('promotion:studentDialog.removeAll') as string}
                    </Button>
                  </div>

                  <div className="box-col-full bg-white border border-gray-200 rounded-lg">
                    {selectedStudents.map(student => (
                      <div
                        key={student.value}
                        className="box-row-full items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50"
                      >
                        <div className="box-row-full items-center gap-3 justify-start">
                          {/* <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          /> */}
                          <div className="w-8 h-8 bg-yellow-200 rounded-full box-row-full items-center justify-center">
                            <LuUser />
                          </div>
                          <Text className="font-semibold text-left">
                            {student.label}
                          </Text>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(student)}
                        >
                          <LuTrash2 className="text-warn" size={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ContentLayout>
    </Drawer>
  )
}

export default OptionStudentDialog
