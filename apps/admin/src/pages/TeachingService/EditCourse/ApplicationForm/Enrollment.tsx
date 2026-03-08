import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'
import { BsFillCalendarDateFill, BsFillTelephoneFill } from 'react-icons/bs'
import { FaHeading } from 'react-icons/fa'
import { GrTextAlignFull } from 'react-icons/gr'
import { IoToggle } from 'react-icons/io5'
import {
  MdNumbers,
  MdOutlineArrowDropDownCircle,
  MdOutlineCheckBox,
  MdOutlineDeleteForever,
  MdRadioButtonChecked,
  MdShortText,
} from 'react-icons/md'
import { useRecoilState } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

import RingSpinner1 from '@/assets/svgs/spinners/RingSpinner1'
import {
  DraggableCard,
  DraggableContainer,
} from '@/components/Containers/Draggable'
import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import useCourseData from '@/hooks/useCourseData'
import { courseState } from '@/stores/courseData'
import { Course, QuestionData } from '@/types/course'

import EnrollmentQuestionModal, {
  EnrollmentQuestionModalHandle,
} from './EnrollmentQuestionModal'

const defaultQuestionData = (): QuestionData => {
  return {
    id: uuidv4(), // unique id for map rendering
    fieldData: [], // tags or category for field
    inputType: 'input_short_answer',
    validation: 'validation_optional',
    description: '',
    fieldKey: [],
  }
}

interface EnrollmentProps {
  tabName: string
  currentCourse: Course
  setCurrentCourse: Dispatch<SetStateAction<Course>>
}
const Enrollment = ({
  tabName,
  currentCourse,
  setCurrentCourse,
}: EnrollmentProps): JSX.Element => {
  const { useUpdateCourseEnrollment } = useCourseData()
  const { mutateAsync, isLoading } = useUpdateCourseEnrollment()
  const enrollmentQuestionModalHandle =
    useRef<EnrollmentQuestionModalHandle>(null)
  const [courseRecoilState, setCourseRecoilState] = useRecoilState(courseState)
  const [unSavedChanges, setUnSavedChanges] = useState<boolean>(false)
  const openModal = () => {
    enrollmentQuestionModalHandle.current?.handleOpenChange?.()
  }

  useEffect(() => {
    const customFields1 = courseRecoilState?.currentCourse?.customFields || []
    const customFields2 = currentCourse.customFields || []

    if (customFields1.length !== customFields2.length) {
      setUnSavedChanges(true)
    } else if (
      !customFields1.every((value, index) => {
        const ele = customFields2[index]
        return (
          value.inputType === ele.inputType &&
          value.validation === ele.validation &&
          value.description === ele.description
        )
      })
    ) {
      setUnSavedChanges(true)
    }
  }, [currentCourse.customFields])
  // ====================================== //
  // Reform it if it is old data structure  //
  // ====================================== //
  if (
    currentCourse.customFields &&
    currentCourse.customFields?.length > 0 &&
    JSON.stringify(Object.keys(currentCourse.customFields[0])) !==
      JSON.stringify([
        'id',
        'fieldData',
        'inputType',
        'validation',
        'description',
        'fieldKey',
      ])
  ) {
    const updatedFields = currentCourse.customFields.map(field => ({
      id: field.id ?? uuidv4(),
      fieldData: field.fieldData ?? [],
      inputType: field.inputType ?? 'input_short_answer',
      validation: field.validation ?? 'validation_required',
      description: field.description ?? '',
      fieldKey: [],
    }))
    setCurrentCourse({
      ...currentCourse,
      customFields: updatedFields as QuestionData[],
    })
  }

  const handleAddQuestionData = (questionData: QuestionData) => {
    setCurrentCourse((prevCourse: Course): Course => {
      return {
        ...prevCourse,
        customFields: [
          ...(prevCourse.customFields || []),
          questionData,
        ] as QuestionData[],
      }
    })
  }

  const handleEditQuestionData = (
    questionData: QuestionData,
    index: string
  ) => {
    setCurrentCourse((prevCourse: Course): Course => {
      let updatedFields: QuestionData[] = []
      if (prevCourse && prevCourse.customFields) {
        updatedFields = prevCourse.customFields.map(field => {
          if (field.id === index) {
            return questionData
          }
          return field
        })
      }
      return {
        ...prevCourse,
        customFields: updatedFields,
      }
    })
  }

  const handleDeleteQuestionData = (index: string): void => {
    setCurrentCourse((prevCourse: Course): Course => {
      let updatedFields: QuestionData[] = []
      if (prevCourse && prevCourse.customFields) {
        updatedFields = prevCourse.customFields.filter(
          field => field.id !== index
        )
      }
      return {
        ...prevCourse,
        customFields: updatedFields,
      }
    })
  }

  const submitQuestionDataUpdateToServer = async (): Promise<void> => {
    if (!currentCourse) return
    mutateAsync({
      courseId: currentCourse?.id,
      institutionId: currentCourse?.institutionId,
      enableSpecialStudy: currentCourse?.enableSpecialStudy,
      // specialStudy: currentCourse?.specialStudy ?? {
      //   ...defaultQuestionData(),
      //   description: 'Special Study',
      // },
      enableSchoolName: currentCourse?.enableSchoolName,
      // schoolNameField: currentCourse?.schoolNameField ?? {
      //   ...defaultQuestionData(),
      //   description: 'School Name',
      // },
      customFields: currentCourse?.customFields ?? [],
    })
    setUnSavedChanges(false)
    setCourseRecoilState(prevCourseState => ({
      ...prevCourseState,
      currentCourse,
    }))
  }

  // const SpecialStudyField = (): JSX.Element => {
  //   return (
  //     <SpecialStudyFieldBox>
  //       {!isMobile && (
  //         <DragableBoxHandler>
  //           <MdOutlineDragIndicator size="2rem" />
  //         </DragableBoxHandler>
  //       )}
  //       <Box justify="space-between" css={{ padding: '0 $4' }}>
  //         <IconBox>
  //           <FaWheelchair size="2rem" />
  //         </IconBox>
  //         <DragableBoxText>
  //           {t('enrollment.enrollmentForm.specialStudy')}
  //         </DragableBoxText>
  //         <Box css={{ width: '4rem' }}>
  //           <Switch
  //             css={{ width: 'fit-content' }}
  //             checked={currentCourse.enableSpecialStudy}
  //             onCheckedChange={checked => {
  //               setCurrentCourse({
  //                 ...currentCourse,
  //                 enableSpecialStudy: checked,
  //               })
  //             }}
  //           />
  //         </Box>
  //       </Box>
  //     </SpecialStudyFieldBox>
  //   )
  // }
  const handleDragEnd = (newData: QuestionData[]) => {
    setCurrentCourse((prevCourse: Course) => {
      return {
        ...prevCourse,
        customFields: newData,
      }
    })
  }

  return (
    <Box id={tabName} direction="col" gap="lg">
      <Box justify="end">
        <SaveButton
          isLoading={isLoading}
          submitQuestionDataUpdateToServer={submitQuestionDataUpdateToServer}
          unSavedChanges={unSavedChanges}
        />
      </Box>
      <div className="flex flex-col justify-center items-center w-full border border-background-layer-3 rounded-md gap-6 sm:w-full sm:p-4">
        {/* <SpecialStudyField /> */}
        <DraggableContainer
          items={currentCourse.customFields ?? []}
          handleDragEnd={handleDragEnd}
        >
          {currentCourse.customFields?.map(field => (
            <DraggableCard id={field.id} key={field.id}>
              <EnrollmentCard
                field={field}
                currentCourse={currentCourse}
                handleEditQuestionData={handleEditQuestionData}
                handleDeleteQuestionData={handleDeleteQuestionData}
              />
            </DraggableCard>
          ))}
        </DraggableContainer>
        <CreateNewFieldButton openModal={openModal} />
        <EnrollmentQuestionModal
          ref={enrollmentQuestionModalHandle}
          hidden
          currentCourse={currentCourse}
          questionData={defaultQuestionData()}
          handleQuestionDataSubmit={handleAddQuestionData}
        />
      </div>
    </Box>
  )
}

interface EnrollmentCardProps {
  field: QuestionData
  handleDeleteQuestionData: (index: string) => void
  currentCourse: Course
  handleEditQuestionData: (questionData: QuestionData, index: string) => void
}

const EnrollmentCard = ({
  field,
  handleDeleteQuestionData,
  currentCourse,
  handleEditQuestionData,
}: EnrollmentCardProps): JSX.Element => {
  return (
    <div className="flex flex-row flex-wrap content-center justify-between items-center w-full h-fit rounded-md">
      <div className="flex justify-center w-10 mr-[3%]">
        <CustomFieldIcon field={field} />
      </div>
      <Text className="w-[65%] break-all flex items-center">
        <span>
          {field.description}
          {field.validation === 'validation_required' && (
            <span style={{ color: '#cf3232' }}>*</span>
          )}
        </span>
      </Text>
      <Box className="w-fit">
        <EnrollmentQuestionModal
          questionData={field}
          currentCourse={currentCourse}
          handleQuestionDataSubmit={questionData =>
            handleEditQuestionData(questionData, field.id)
          }
        />
        <Box
          onClick={() => handleDeleteQuestionData(field.id)}
          className="cursor-pointer"
        >
          <MdOutlineDeleteForever size="2rem" color="#cf3232" />
        </Box>
      </Box>
    </div>
  )
}

interface SaveButtonProps {
  isLoading: boolean
  submitQuestionDataUpdateToServer: () => Promise<void>
  unSavedChanges: boolean
}

const SaveButton = ({
  isLoading,
  submitQuestionDataUpdateToServer,
  unSavedChanges,
}: SaveButtonProps): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  return (
    <Button
      size="md"
      className="self-end"
      onClick={submitQuestionDataUpdateToServer}
      disabled={isLoading || !unSavedChanges}
    >
      {isLoading ? (
        <SvgIcon>
          <RingSpinner1 />
        </SvgIcon>
      ) : (
        t(`school:saveSchool`)
      )}
    </Button>
  )
}

const CreateNewFieldButton = ({
  openModal,
}: {
  openModal: MouseEventHandler<HTMLParagraphElement>
}): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  return (
    <div className="flex justify-center w-full rounded-md p-2">
      <Text
        className="text-primary cursor-pointer self-center hover:underline hover:text-primary-highlight"
        onClick={openModal}
      >
        {t('enrollment.enrollmentForm.addNewField')}
      </Text>
    </div>
  )
}

const CustomFieldIcon = ({ field }: { field: QuestionData }): JSX.Element => {
  switch (field.inputType) {
    case 'display_header':
      return <FaHeading size="1.8rem" />
    case 'input_short_answer':
      return <MdShortText size="2.2rem" />
    case 'input_paragraph':
      return <GrTextAlignFull size="2rem" />
    case 'input_number':
      return <MdNumbers size="2rem" />
    case 'input_multiple_choice':
      return <MdRadioButtonChecked size="2rem" />
    case 'input_checkbox':
      return <MdOutlineCheckBox size="2rem" />
    case 'input_dropdown':
      return <MdOutlineArrowDropDownCircle size="2rem" />
    case 'input_toggle_switch':
      return <IoToggle size="2rem" />
    case 'input_phone':
      return <BsFillTelephoneFill size="2rem" />
    case 'input_date':
      return <BsFillCalendarDateFill size="2rem" />
    default:
      return <></>
  }
}

export default Enrollment
