import { Control, useFieldArray, UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { PrerequisiteCourseDto } from '@/api/courses'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import { Button } from '@/components/ui/Button'

import ConditionsFormItem from './ConditionsFormItem'

type IProps = {
  groupIndex: number
  control: Control<PrerequisiteCourseDto>
  removeGroup: (index: number) => void
  setValue: UseFormSetValue<any>
  setUnSavedChanges: (value: boolean) => void
  optsCourses: SimpleSelectorItemProps[]
  optsClasses: (courseName: any) => SimpleSelectorItemProps[]
}

const ConditionsForm = ({
  groupIndex,
  control,
  removeGroup,
  setValue,
  optsCourses,
  optsClasses,
  setUnSavedChanges,
}: IProps): JSX.Element => {
  const { t } = useTranslation()
  const conditionName = `groups.${groupIndex}.conditions`
  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: conditionName as any,
  })

  return (
    <div>
      {conditionFields.map((condition, conditionIndex) => {
        return (
          <ConditionsFormItem
            // eslint-disable-next-line react/no-array-index-key
            key={`${groupIndex}-${condition.id}-${conditionIndex}`}
            conditionIndex={conditionIndex}
            groupIndex={groupIndex}
            control={control}
            setValue={setValue}
            optsCourses={optsCourses}
            optsClasses={optsClasses}
            setUnSavedChanges={setUnSavedChanges}
            removeCondition={removeCondition}
          />
        )
      })}
      <div className="flex justify-between items-end mt-4">
        <Button
          className="add-button p-0 h-fit"
          type="button"
          variant="link"
          onClick={() => {
            appendCondition({ courseId: null, classId: null, operator: 'OR' })
            setUnSavedChanges(true)
          }}
        >
          + {t('teachingService:prerequisites.newCondition')}
        </Button>
        {/* <RiDeleteBinLine
          fill="red"
          onClick={() => {
            removeGroup(groupIndex)
            setUnSavedChanges(true)
          }}
          className="cursor-pointer w-[25px] h-[25px]"
        /> */}
      </div>
    </div>
  )
}

export default ConditionsForm
