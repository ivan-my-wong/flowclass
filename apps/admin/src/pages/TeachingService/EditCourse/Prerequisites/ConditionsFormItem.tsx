import { UseFieldArrayRemove } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from 'react-icons/ri'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

import { optsOperators } from './index'

type PropsType = {
  conditionIndex: number
  removeCondition: UseFieldArrayRemove
  groupIndex: number
  control: any
  setValue: any
  setUnSavedChanges: (value: boolean) => void
  optsCourses: SimpleSelectorItemProps[]
  optsClasses: (courseName: any) => SimpleSelectorItemProps[]
}
const ConditionsFormItem = ({
  conditionIndex,
  removeCondition,
  control,
  setValue,
  groupIndex,
  optsClasses,
  optsCourses,
  setUnSavedChanges,
}: PropsType): JSX.Element => {
  const path = `groups.${groupIndex}.conditions.${conditionIndex}`
  const courseName = `${path}.courseId` as string
  const className = `${path}.classId` as string
  const operatorName = `${path}.operator` as string
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-4 items-start">
      <div className="md:col-span-2">
        <FormField
          control={control}
          rules={{
            required: t(
              'teachingService:prerequisites.courseIsRequired'
            ) as string,
          }}
          name={courseName}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t(`promotion:teachingService`)}</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value: string) => {
                    setValue(courseName, +value)
                    setValue(className, null)
                    field.onChange(+value)
                  }}
                  value={field.value?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {optsCourses.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={control}
          rules={{
            required: t(
              'teachingService:prerequisites.classIsRequired'
            ) as string,
          }}
          name={className}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>
                {t(`teachingService:courseTabLabel.class`)}
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value: string) => {
                    setValue(className, +value)
                    field.onChange(+value)
                  }}
                  value={field.value?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {optsClasses(courseName).map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />
      </div>
      <div className="flex gap-4 items-center">
        <FormField
          control={control}
          rules={{
            required: t(
              'teachingService:prerequisites.operatorIsRequired'
            ) as string,
          }}
          name={operatorName}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel required>
                {t(`teachingService:prerequisites.operation`)}
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  disabled
                  value="OR"
                  onValueChange={(value: string) => {
                    setValue(operatorName, value)
                    field.onChange(value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {optsOperators.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />

        <div className="mt-6">
          <RiDeleteBinLine
            fill="red"
            onClick={() => {
              removeCondition(conditionIndex)
              setUnSavedChanges(true)
            }}
            className="cursor-pointer w-[25px] h-[25px]"
          />
        </div>
      </div>
    </div>
  )
}

export default ConditionsFormItem
