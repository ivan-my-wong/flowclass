import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import update from 'immutability-helper'
import { useTranslation } from 'react-i18next'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import { CustomToastContainer } from '@/components/CustomToast/CustomToastContainer'
import TextEditor from '@/components/Inputs/TextEditor'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import PromptDialog from '@/components/Popups/PromptDialog'
import Text from '@/components/Texts/Text'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import { ToggleGroupLabelsProps } from '@/components/ToggleGroup/ToggleGroup'
import { ToggleGroupDropdownMenuModules } from '@/components/ToggleGroup/ToggleGroupItem'
import Popover from '@/components/Tooltips/Popover'
import Tooltip from '@/components/Tooltips/Tooltip'
import TourGuide from '@/components/Tour/TourGuide'
import { TourGuideKeys } from '@/constants/guides'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { SectionDescription } from '@/types/course'
import { DropDownMenuType } from '@/types/options'
import { SectionTag } from '@/types/school'
import { cn } from '@/utils/cn'

import { getDescriptionTourSteps } from './schoolTourSteps'

interface DescriptionProps {
  tabName: string
  allSaveMethods: any
}

const defaultLabels: SectionTag[] = [
  'SCHOOL_ABOUT_US',
  'SCHOOL_FACILITIES',
  'SCHOOL_STUDENT_ACHIEVEMENT',
  'SCHOOL_QUALIFICATION_AWARDS',
  'SCHOOL_SUPPORT',
  'SCHOOL_FAQS',
]

const defaultSectionValue = '<p><br></p>'
export const initializeSchoolSectionValues = () => {
  const longDescArr: SectionDescription[] = []
  defaultLabels.forEach(key => {
    longDescArr.push({
      content: defaultSectionValue,
      sectionTitle: key as SectionTag,
    })
  })
  return longDescArr
}

const Description = ({
  tabName,
  allSaveMethods,
}: DescriptionProps): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()
  const {
    currentSchool,
    setCurrentSchool,
    isUnsavedChanges,
    setIsUnsavedChanges,
  } = useSchoolEditSave()
  const [currentSection, setCurrentSection] = useState<SectionTag | string>('')
  const { useUpdateSchool } = useSchoolData()
  const updateSchoolResult = useUpdateSchool(currentSchool?.id ?? 0, true)

  useEffect(() => {
    if (!currentSchool) return

    if (currentSchool?.description?.length && !currentSection) {
      setCurrentSection(currentSchool.description[0].sectionTitle as SectionTag)
    } else if (!currentSchool?.description?.length) {
      setCurrentSchool({
        ...currentSchool,
        description: initializeSchoolSectionValues(),
      })
      setCurrentSection(defaultLabels[0])
    }
  }, [currentSchool])

  const isDescriptionUpdated = (
    currentDesc: SectionDescription[],
    incomingDesc: SectionDescription[]
  ): boolean => {
    if (currentDesc.length <= 0) return true
    if (currentDesc.length !== incomingDesc.length) return false
    let ret = false
    incomingDesc.forEach((value, index) => {
      if (JSON.stringify(value) !== JSON.stringify(currentDesc[index])) {
        ret = true
      }
    })
    return ret
  }

  const handleDescriptionChange = (description: any): void => {
    if (
      currentSchool &&
      currentSchool.description &&
      isDescriptionUpdated(currentSchool.description, description)
    ) {
      setCurrentSchool({
        ...currentSchool,
        description,
      })
      setIsUnsavedChanges(true)
    }
  }

  const isValidateSectionTitle = (label: string): boolean => {
    if (label === '') {
      toast.warning(t('school:emptySectionWarn'))
      return false
    }
    const isDuplicate =
      currentSchool &&
      currentSchool.description &&
      currentSchool.description.some(
        e => e.sectionTitle.toString() === label.toString()
      )
    if (isDuplicate) {
      toast.warning(t('school:duplicateSectionWarn'))
      return false
    }
    return true
  }

  const formatSectionTitle = (label: string): string => {
    const MARCO_CASE_LABEL = label.trim().toUpperCase().replaceAll(' ', '_')
    if (t(`component:SectionTag.${MARCO_CASE_LABEL}`).includes('SectionTag.')) {
      return label
    }
    return MARCO_CASE_LABEL
  }

  const handleCreateSection = (input: string) => {
    if (!currentSchool) return
    // Format Section Title
    const formatedInput = formatSectionTitle(input)
    // Validate Section Title
    const isValidate = isValidateSectionTitle(formatedInput)
    if (!isValidate) return
    // Perform Section List Update
    const newSectionTitleList = currentSchool.description ?? []
    setCurrentSchool({
      ...currentSchool,
      description: [
        ...newSectionTitleList,
        { content: '<p><br></p>', sectionTitle: formatedInput },
      ],
    })
  }

  const currentDeleteSection = useRef<string>('')
  const [showDeleteSectionPopUp, setShowDeleteSectionPopUp] =
    useState<boolean>(false)
  // Original handleDeleteSection -> openDeleteSectionPopupPopup
  const openDeleteSectionPopupPopup = (label: string) => {
    if (
      currentSchool &&
      currentSchool.description &&
      currentSchool.description.length <= 1
    ) {
      toast.warning(t('school:noSectionWarn'))
    } else {
      currentDeleteSection.current = label
      setShowDeleteSectionPopUp(true)
    }
  }

  // Original handleDeletePopup -> handleDeleteSection
  const handleDeleteSection = () => {
    if (!currentSchool) return
    const newSectionTitleList = currentSchool.description
      ? currentSchool.description.filter(
          item => item.sectionTitle !== currentDeleteSection.current
        )
      : []
    setCurrentSchool({
      ...currentSchool,
      description: newSectionTitleList,
    })
    setCurrentSection(newSectionTitleList[0].sectionTitle as SectionTag)
    setShowDeleteSectionPopUp(false)
    setIsUnsavedChanges(true)
  }

  const handleOrderSection = useCallback(
    (dragIndex: number, hoverIndex: number): void => {
      if (!currentSchool || !currentSchool.description) return
      const dragCard = currentSchool.description[dragIndex]
      setCurrentSchool({
        ...currentSchool,
        description: update(currentSchool.description, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
      })
    },
    [currentSchool?.description]
  )

  const handleEditSection = useCallback(
    (label: string, newLabel: string): boolean => {
      const formatedInput = formatSectionTitle(newLabel)

      if (label === formatedInput) return true
      if (!isValidateSectionTitle(formatedInput)) return false
      if (!currentSchool || !currentSchool.description) return false

      const editingElement = currentSchool.description.find(
        item => item.sectionTitle === label
      )
      const newElement = {
        sectionTitle: formatedInput as SectionTag | string,
        content: editingElement?.content as string,
      }

      setCurrentSection(formatedInput as SectionTag | string)
      setCurrentSchool({
        ...currentSchool,
        description: currentSchool.description?.map(item =>
          item.sectionTitle === label ? newElement : item
        ),
      })
      setIsUnsavedChanges(true)
      return true
    },
    [currentSchool?.description]
  )

  const sectionTitleList = currentSchool?.description
    ? currentSchool.description.map(item => item.sectionTitle)
    : initializeSchoolSectionValues().map(item => item.sectionTitle)

  const toggleGroupLabels = useMemo(() => {
    return sectionTitleList?.map(label => {
      return {
        value: label,
        label: t(`component:SectionTag.${label}`).replace('SectionTag.', ''),
        onEdit: handleEditSection,
        onDelete: openDeleteSectionPopupPopup,
        actionButton: <></>,
      }
    })
  }, [sectionTitleList])

  const handleDragEnd = (newData: ToggleGroupLabelsProps[]) => {
    if (!currentSchool) return
    const newLongDescriptions = newData.map(item => {
      const result = currentSchool?.description?.find(
        longDesc => longDesc.sectionTitle === item.value
      )
      return {
        ...(result as SectionDescription),
      }
    })
    setCurrentSchool({
      ...currentSchool,
      description: newLongDescriptions,
    })
  }

  const safeLongDescription = (s?: any): SectionDescription[] => {
    if (!s) {
      return []
    }
    if (typeof s === 'string') {
      return [
        {
          sectionTitle: currentSection,
          content: s,
        },
      ]
    }
    return s
  }

  const handleSaveAll = useCallback(async () => {
    if (currentSchool && isUnsavedChanges) {
      await updateSchoolResult.mutateAsync({
        description: currentSchool.description,
      })
      setIsUnsavedChanges(false)
    }
  }, [currentSchool, isUnsavedChanges, updateSchoolResult])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  return (
    <Box
      direction="column"
      id={tabName}
      className={cn('flex w-full sm:w-full sm:justify-center')}
    >
      <BoxWithToggleGroup
        toggleGroupLabels={toggleGroupLabels}
        title={t('school:selectSection')}
        actionButton={
          <PromptDialog
            title={t('school:createSection')}
            desc={t('school:writeNewSection') as string}
            onCreate={handleCreateSection}
          />
        }
        dropdownMenuModules={[
          ToggleGroupDropdownMenuModules.EDIT,
          ToggleGroupDropdownMenuModules.DELETE,
        ]}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        // handleOrderSection={handleOrderSection}
        // isDraggable
        draggable
        handleDragEnd={handleDragEnd}
        type={DropDownMenuType.Section}
        handleOrderSection={handleOrderSection}
      >
        <Box direction="column" gap="large">
          <Box justify="space-between">
            {isMobile || isTablet ? (
              <Popover
                trigger={
                  <div>
                    <Box>
                      <AiOutlineQuestionCircle />
                      <Text className="block border-b border-dotted">
                        {t(`school:hints.needSomeGuidance`)}
                      </Text>
                    </Box>
                  </div>
                }
              >
                <Text>{t(`school:hints.school.${currentSection}`)}</Text>
              </Popover>
            ) : (
              <Tooltip
                trigger={
                  // trigger component must be wrapped by div idk why
                  <div>
                    <Box className="cursor-help">
                      <AiOutlineQuestionCircle />
                      <Text className="block underline decoration-dotted">
                        {t(`school:hints.needSomeGuidance`)}
                      </Text>
                    </Box>
                  </div>
                }
              >
                <Text className="block">
                  {t(`school:hints.school.${currentSection}`)}
                </Text>
              </Tooltip>
            )}
          </Box>
          <TextEditor
            style={{ width: '100%', height: 'calc(100vh - 260px)' }}
            theme="snow"
            content={safeLongDescription(currentSchool?.description)}
            currentSection={currentSection}
            imageDirectory={MediaFileDirectory.INSTITUTION}
            onValueChange={handleDescriptionChange}
          />
        </Box>
      </BoxWithToggleGroup>
      <CustomedAlertDialog
        open={showDeleteSectionPopUp}
        setOpen={setShowDeleteSectionPopUp}
        alertType={AlertTypes.WARN}
        description={t(`school:discardSectionWarn`) as string}
        title={
          ` ${t(`common:action.delete`)} ${t(
            `component:SectionTag.${currentDeleteSection.current}`
          ).replace('SectionTag.', '')}` as string
        }
        cancelText={t(`common:action.cancel`) as string}
        actionText={t(`common:action.confirm`) as string}
        onActionClick={handleDeleteSection}
      />
      <CustomToastContainer />
      <TourGuide
        tourGuideKey={TourGuideKeys.schoolDescription}
        steps={getDescriptionTourSteps()}
        icon
        autoStart={false}
      />
    </Box>
  )
}

export default Description
