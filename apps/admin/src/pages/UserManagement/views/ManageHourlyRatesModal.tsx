import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import { toast } from 'sonner'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import useCourseData from '@/hooks/useCourseData'
import useInstructorRates from '@/hooks/useInstructors'
import useSiteData from '@/hooks/useSiteData'
import {
  InstructorRate,
  UpdateInstructorRateDto,
} from '@/types/instructorProfiles'
import { StaffUserType } from '@/types/user'

interface ManageHourlyRatesModalProps {
  open: boolean
  onClose: () => void
  selectedUserRole: StaffUserType | null
}

interface RateRow {
  id?: number
  courseId: number | null
  courseName: string
  classIds: number[] | null
  classNames: string[]
  hourlyRate: number
  isDefaultRate: boolean
  isActive: boolean
  minimumStudents?: number | null
  additionalSalaryPerStudent?: number | null
}

export default function ManageHourlyRatesModal({
  open,
  onClose,
  selectedUserRole,
}: ManageHourlyRatesModalProps): JSX.Element {
  const { t } = useTranslation()
  const { currency } = useSiteData()
  const [isEnableHourlyRates, setIsEnableHourlyRates] = useState(false)
  const [isEnableStudentRates, setIsEnableStudentRates] = useState(false)
  const [minimumStudents, setMinimumStudents] = useState(1)
  const [additionalSalaryPerStudent, setAdditionalSalaryPerStudent] =
    useState(0)
  const [rates, setRates] = useState<RateRow[]>([])
  const [showAddClass, setShowAddClass] = useState(false)
  const [newClassRate, setNewClassRate] = useState({
    selectedOptions: [] as any,
    hourlyRate: 0,
    minimumStudents: null as number | null,
    additionalSalaryPerStudent: null as number | null,
  })

  const {
    useGetInstructorRates,
    useCreateOrUpdateInstructorRates,
    useUpdateInstructorRatesEnabled,
  } = useInstructorRates()
  const { useFetchAllCourseData, getFilteredCourseOptions } = useCourseData()

  const { data: courses } = useFetchAllCourseData()

  const options = getFilteredCourseOptions()

  const {
    data: instructorRatesData,
    isLoading: isLoadingRates,
    refetch: refetchRates,
  } = useGetInstructorRates(selectedUserRole?.id || 0, {
    enabled: open && !!selectedUserRole?.id, // Only fetch when modal is open and userRole id is available
  })

  const createOrUpdateInstructorRatesMutation =
    useCreateOrUpdateInstructorRates(selectedUserRole?.id || 0, () => {
      // Refetch rates after successful update
      refetchRates()
      onClose()
    })

  const updateInstructorRatesEnabledMutation = useUpdateInstructorRatesEnabled(
    selectedUserRole?.id || 0
  )

  useEffect(() => {
    if (instructorRatesData && courses) {
      const formattedRates: RateRow[] = instructorRatesData.rates.map(
        (rate: InstructorRate) => {
          const course = courses.find(c => c.id === rate.courseId)

          return {
            id: rate.id,
            courseId: rate.courseId,
            courseName: course?.name || 'Default',
            classIds: rate.classIds,
            classNames:
              rate.classIds?.map(classId => {
                const foundClass = course?.classes?.find(
                  cls => cls.id === classId
                )
                return foundClass?.name || `Class ${classId}`
              }) || [],
            hourlyRate: rate.hourlyRate,
            isDefaultRate: rate.isDefaultRate,
            isActive: rate.isActive,
            minimumStudents: rate.minimumStudents,
            additionalSalaryPerStudent: rate.additionalSalaryPerStudent,
          }
        }
      )

      // Always ensure there's a default rate
      if (!formattedRates.find(r => r.isDefaultRate)) {
        formattedRates.unshift({
          courseId: null,
          courseName: 'Default',
          classIds: null,
          classNames: [],
          hourlyRate: 0,
          isDefaultRate: true,
          isActive: true,
        })
      }

      setRates(formattedRates)

      setIsEnableHourlyRates(instructorRatesData.isEnabled)
      setIsEnableStudentRates(
        instructorRatesData.isStudentRatesEnabled || false
      )
      if (instructorRatesData.studentRatesConfig) {
        setMinimumStudents(
          instructorRatesData.studentRatesConfig.minimumStudents ?? 1
        )
        setAdditionalSalaryPerStudent(
          instructorRatesData.studentRatesConfig.additionalSalaryPerStudent || 0
        )
      } else {
        setMinimumStudents(1)
        setAdditionalSalaryPerStudent(0)
      }
    } else if (courses) {
      // If no rates data but courses are available, create default rate
      setRates([
        {
          courseId: null,
          courseName: 'Default',
          classIds: null,
          classNames: [],
          hourlyRate: 0,
          isDefaultRate: true,
          isActive: true,
        },
      ])
      setMinimumStudents(1)
      setAdditionalSalaryPerStudent(0)
    }
  }, [instructorRatesData, courses])

  const handleSaveChanges = async () => {
    if (!selectedUserRole) return

    try {
      // Update enabled status using existing hook with new parameters
      await updateInstructorRatesEnabledMutation.mutateAsync({
        isInstructorRatesEnabled: isEnableHourlyRates,
        isStudentRatesEnabled: isEnableStudentRates,
        studentRatesConfig: isEnableStudentRates
          ? {
              minimumStudents,
              additionalSalaryPerStudent,
            }
          : null,
      })
    } catch (error) {
      toast.error(
        t('setting:userManagement.hourlyRates.enableHourlyRatesError')
      )
    } finally {
      onClose()
    }

    if (!isEnableHourlyRates) {
      return
    }

    try {
      // Then update rates
      const ratesToUpdate: UpdateInstructorRateDto[] = rates.map(rate => ({
        courseId: rate.courseId ?? undefined,
        classIds: rate.classIds ?? undefined,
        hourlyRate: rate.hourlyRate,
        isDefaultRate: rate.isDefaultRate,
        isActive: rate.isActive,
        minimumStudents: rate.minimumStudents,
        additionalSalaryPerStudent: rate.additionalSalaryPerStudent,
      }))

      await createOrUpdateInstructorRatesMutation.mutateAsync(ratesToUpdate)
    } catch (error) {
      console.error('Error updating rates:', error)
    }
  }

  const handleAddClass = () => {
    setShowAddClass(true)
  }

  const getExistingClassIds = useMemo(() => {
    const existingClassIds = new Set<number>()
    rates.forEach(rate => {
      if (rate.classIds) {
        rate.classIds.forEach(classId => existingClassIds.add(classId))
      }
    })
    return existingClassIds
  }, [rates])

  const availableCourseOptions = useMemo(() => {
    return (
      courses
        ?.map(course => ({
          label: course.name || 'Unknown Course',
          options: (course.classes || [])
            .filter(cls => !getExistingClassIds.has(cls.id))
            .map(cls => ({
              value: cls.id,
              label: cls.name || 'Unknown Class',
              course: course.name || 'Unknown Course',
              courseId: course.id,
              previewImageUrl: null,
            })),
        }))
        .filter(courseGroup => courseGroup.options.length > 0) || []
    )
  }, [courses, getExistingClassIds])

  const handleAddNewClassRate = () => {
    if (
      newClassRate.selectedOptions.length > 0 &&
      newClassRate.hourlyRate >= 0
    ) {
      const selectedClassIds = newClassRate.selectedOptions.map(
        (option: any) => option.value
      )
      const duplicateClassIds = selectedClassIds.filter((classId: number) =>
        getExistingClassIds.has(classId)
      )

      if (duplicateClassIds.length > 0) {
        toast.error(t('setting:userManagement.hourlyRates.duplicateClassError'))
        return
      }

      // Group selected options by course
      const courseGroups = newClassRate.selectedOptions.reduce(
        (groups, option: any) => {
          const { courseId } = option
          if (!groups[courseId]) {
            return {
              ...groups,
              [courseId]: {
                courseId,
                courseName: option.course,
                classIds: [option.value],
                classNames: [option.label],
              },
            }
          }
          return {
            ...groups,
            [courseId]: {
              ...groups[courseId],
              classIds: [...groups[courseId].classIds, option.value],
              classNames: [...groups[courseId].classNames, option.label],
            },
          }
        },
        {} as Record<
          number,
          {
            courseId: number
            courseName: string
            classIds: number[]
            classNames: string[]
          }
        >
      )

      // Create a rate for each course
      Object.values(courseGroups).forEach(courseGroup => {
        const typedCourseGroup = courseGroup as {
          courseId: number
          courseName: string
          classIds: number[]
          classNames: string[]
        }
        const newRate: RateRow = {
          courseId: typedCourseGroup.courseId,
          courseName: typedCourseGroup.courseName,
          classIds: typedCourseGroup.classIds,
          classNames: typedCourseGroup.classNames,
          hourlyRate: newClassRate.hourlyRate,
          isDefaultRate: false,
          isActive: true,
          minimumStudents: null,
          additionalSalaryPerStudent: null,
        }
        setRates(prev => [...prev, newRate])
      })

      setNewClassRate({
        selectedOptions: [],
        hourlyRate: 0,
        minimumStudents: null,
        additionalSalaryPerStudent: null,
      })
      setShowAddClass(false)
    } else if (newClassRate.selectedOptions.length === 0) {
      toast.error(t('setting:userManagement.hourlyRates.selectAtLeastOneClass'))
    }
  }

  const handleCancelAddClass = () => {
    setNewClassRate({
      selectedOptions: [],
      hourlyRate: 0,
      minimumStudents: null,
      additionalSalaryPerStudent: null,
    })
    setShowAddClass(false)
  }

  const handleDeleteRate = (index: number) => {
    const newRates = rates.filter((_, i) => i !== index)
    setRates(newRates)
  }

  const handleRateChange = (
    index: number,
    field: keyof RateRow,
    value: any
  ) => {
    const newRates = [...rates]
    newRates[index] = { ...newRates[index], [field]: value }
    setRates(newRates)
  }

  const getClassesDisplay = (rate: RateRow) => {
    if (rate.isDefaultRate) return 'N/A'
    if (rate.classIds && rate.classIds.length > 0) {
      if (rate.classIds.length === 1) {
        return rate.classNames[0]
      }
      return `${rate.classNames[0]} +${rate.classIds.length - 1}`
    }
    return 'All Classes'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('setting:userManagement.hourlyRates.manageHourlyRates')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            {/* Enable Hourly Rates Toggle */}
            <div className="flex gap-2 items-center justify-between rounded-lg">
              <Switch
                checked={isEnableHourlyRates}
                onCheckedChange={setIsEnableHourlyRates}
              />
              <span className="font-medium">
                {t('setting:userManagement.hourlyRates.enableHourlyRates')}
              </span>
            </div>
            {/* Enable Hourly Rates By Students Toggle */}
            {isEnableHourlyRates && (
              <div className="flex gap-2 items-center justify-between rounded-lg">
                <Switch
                  checked={isEnableStudentRates}
                  onCheckedChange={setIsEnableStudentRates}
                />
                <span className="font-medium">
                  {t(
                    'setting:userManagement.hourlyRates.enableHourlyRatesByStudents'
                  )}
                </span>
              </div>
            )}
          </div>
          <span className="font-bold">
            {t('setting:userManagement.hourlyRates.salaryByClass')}
          </span>
          <p className="text-sm text-gray-600">
            {t('setting:userManagement.hourlyRates.salaryByClassDescription')}
          </p>
          <span className="font-bold">
            {t('setting:userManagement.hourlyRates.minimumNumberOfStudents')}
          </span>
          <p className="text-sm text-gray-600">
            {t('setting:userManagement.hourlyRates.minimumStudentsDescription')}
          </p>
          <span className="font-bold">
            {t('setting:userManagement.hourlyRates.additionalSalaryPerStudent')}
          </span>
          <p className="text-sm text-gray-600">
            {t(
              'setting:userManagement.hourlyRates.additionalSalaryByStudentDescription'
            )}
          </p>
          <Card>
            <CardHeader>
              <CardTitle>
                {t('setting:userManagement.hourlyRates.defaultSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="defaultHourlyRate">
                  {t('setting:userManagement.hourlyRates.defaultHourlyRate')}
                </Label>
                <Input
                  id="defaultHourlyRate"
                  type="number"
                  value={rates.find(rate => rate.isDefaultRate)?.hourlyRate}
                  onChange={e =>
                    handleRateChange(
                      rates.findIndex(rate => rate.isDefaultRate),
                      'hourlyRate',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              {isEnableHourlyRates && isEnableStudentRates && (
                <>
                  {/* Minimum Number of Students */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="minimumStudents">
                      {t(
                        'setting:userManagement.hourlyRates.minimumNumberOfStudents'
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="minimumStudents"
                        type="number"
                        value={minimumStudents}
                        onChange={e =>
                          setMinimumStudents(parseInt(e.target.value, 10) || 0)
                        }
                        className="pr-20"
                        min="0"
                        step="1"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                        {t('setting:userManagement.hourlyRates.studentsUnit')}
                      </span>
                    </div>
                  </div>

                  {/* Additional Salary by Student */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="additionalSalaryPerStudent">
                      {t(
                        'setting:userManagement.hourlyRates.additionalSalaryPerStudent'
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="additionalSalaryPerStudent"
                        type="number"
                        value={additionalSalaryPerStudent}
                        onChange={e =>
                          setAdditionalSalaryPerStudent(
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="pr-28"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                        {t(
                          'setting:userManagement.hourlyRates.perStudentUnit',
                          {
                            currency,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Rates Table */}
          {isEnableHourlyRates && (
            <>
              <div className="flex justify-between">
                <span className="font-bold">
                  {t('setting:userManagement.hourlyRates.classSpecificRates')}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleAddClass}
                  className="text-blue-600 p-0 h-auto"
                >
                  <LuPlus className="w-4 h-4 mr-1" />
                  {t('setting:userManagement.hourlyRates.addClass')}
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('setting:userManagement.hourlyRates.course')}
                      </TableHead>
                      <TableHead>
                        {t('setting:userManagement.hourlyRates.classes')}
                      </TableHead>
                      <TableHead>
                        {t('setting:userManagement.hourlyRates.hourlyRate')}{' '}
                        (HK$)
                      </TableHead>
                      {isEnableStudentRates && (
                        <>
                          <TableHead>
                            {t(
                              'setting:userManagement.hourlyRates.minimumNumberOfStudents'
                            )}
                          </TableHead>
                          <TableHead>
                            {t(
                              'setting:userManagement.hourlyRates.additionalSalaryPerStudent'
                            )}
                          </TableHead>
                        </>
                      )}
                      <TableHead>
                        {t('setting:userManagement.hourlyRates.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate, index) => {
                      if (rate.isDefaultRate) return null
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="font-medium">
                              {rate.courseName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">
                              {getClassesDisplay(rate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={rate.hourlyRate}
                              onChange={e =>
                                handleRateChange(
                                  index,
                                  'hourlyRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          {isEnableStudentRates && (
                            <>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={rate.minimumStudents ?? ''}
                                  onChange={e =>
                                    handleRateChange(
                                      index,
                                      'minimumStudents',
                                      e.target.value === ''
                                        ? null
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                  className="w-24"
                                  min="0"
                                  step="1"
                                  placeholder={minimumStudents.toString()}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={rate.additionalSalaryPerStudent ?? ''}
                                  onChange={e =>
                                    handleRateChange(
                                      index,
                                      'additionalSalaryPerStudent',
                                      e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-24"
                                  min="0"
                                  step="0.01"
                                  placeholder={additionalSalaryPerStudent.toString()}
                                />
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRate(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Add New Class Assignment Section */}
          {showAddClass && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-4">
                {t('setting:userManagement.hourlyRates.addNewClassAssignment')}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="course"
                  >
                    {t('setting:userManagement.hourlyRates.selectClasses')}
                  </label>
                  <CourseAndClassSelector
                    options={options}
                    defaultValue={newClassRate.selectedOptions}
                    onChange={selected => {
                      setNewClassRate(prev => ({
                        ...prev,
                        selectedOptions: selected || [],
                      }))
                    }}
                    width="100%"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    htmlFor="hourlyRate"
                  >
                    {t('setting:userManagement.hourlyRates.hourlyRate')}
                  </label>
                  <Input
                    type="number"
                    value={newClassRate.hourlyRate}
                    onChange={e =>
                      setNewClassRate(prev => ({
                        ...prev,
                        hourlyRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                {isEnableStudentRates && (
                  <>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="minimumStudents"
                      >
                        {t(
                          'setting:userManagement.hourlyRates.minimumNumberOfStudents'
                        )}
                      </label>
                      <div className="relative">
                        <Input
                          id="minimumStudents"
                          type="number"
                          value={newClassRate.minimumStudents ?? ''}
                          onChange={e =>
                            setNewClassRate(prev => ({
                              ...prev,
                              minimumStudents:
                                e.target.value === ''
                                  ? null
                                  : parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full pr-20"
                          min="0"
                          step="1"
                          placeholder={minimumStudents.toString()}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                          {t('setting:userManagement.hourlyRates.studentsUnit')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t(
                          'setting:userManagement.hourlyRates.classSpecificStudentRatesHint'
                        )}
                      </p>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="additionalSalaryPerStudent"
                      >
                        {t(
                          'setting:userManagement.hourlyRates.additionalSalaryPerStudent'
                        )}
                      </label>
                      <div className="relative">
                        <Input
                          id="additionalSalaryPerStudent"
                          type="number"
                          value={newClassRate.additionalSalaryPerStudent ?? ''}
                          onChange={e =>
                            setNewClassRate(prev => ({
                              ...prev,
                              additionalSalaryPerStudent:
                                e.target.value === ''
                                  ? null
                                  : parseFloat(e.target.value),
                            }))
                          }
                          className="w-full pr-28"
                          min="0"
                          step="0.01"
                          placeholder={additionalSalaryPerStudent.toString()}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                          {t(
                            'setting:userManagement.hourlyRates.perStudentUnit',
                            {
                              currency,
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t(
                          'setting:userManagement.hourlyRates.classSpecificStudentRatesHint'
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancelAddClass}>
                  {t('common:action.cancel')}
                </Button>
                <Button onClick={handleAddNewClassRate}>
                  {t('setting:userManagement.hourlyRates.addClass')}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoadingRates}
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleSaveChanges}
              loading={isLoadingRates}
              disabled={isLoadingRates}
            >
              {isLoadingRates
                ? t('common:action.saving')
                : t('setting:userManagement.hourlyRates.saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
