import Checkbox from '@/components/Checkboxes/Checkbox'
import { TagOption } from '@/components/Selector/MultiGroupedSelect'
import Text from '@/components/Texts/Text'

interface CourseTagCheckboxOptionProps {
  label: string
  options: TagOption[]
  isSelected?: boolean
  setGroupedOptions: (val: any) => void
}

const CourseTagCheckboxOption = ({
  label,
  options,
  setGroupedOptions,
}: CourseTagCheckboxOptionProps): JSX.Element => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="text-text w-full font-bold">
        <Text>{label}</Text>
      </div>
      <div className="flex w-full flex-col gap-2">
        {options.map((option, index) => {
          return (
            <div
              key={index}
              className="bg-backgroundLayer2 flex w-full flex-row justify-between p-3"
            >
              <div>
                <Text>{option.value}</Text>
              </div>
              <div>
                <Text>
                  <Checkbox
                    onChange={() => {
                      // setGroupedOptions((prev: GroupedOption) => ({
                      //   ...prev,
                      //     options: enrolForm.currentStep - 1,
                      // }))
                      setGroupedOptions((prevGroupedOptions: any) => {
                        const updatedOptions = prevGroupedOptions.map((groupedOption: any) => {
                          if (groupedOption.label === label) {
                            const updatedGroupedOptions = groupedOption.options.map((opt: any) => {
                              if (opt.value === option.value) {
                                return {
                                  ...opt,
                                  isSelected: !opt.isSelected,
                                }
                              }
                              return opt
                            })
                            return {
                              ...groupedOption,
                              options: updatedGroupedOptions,
                            }
                          }
                          return groupedOption
                        })
                        return updatedOptions
                      })
                    }}
                    value={option.isSelected ?? false}
                  />
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CourseTagCheckboxOption
