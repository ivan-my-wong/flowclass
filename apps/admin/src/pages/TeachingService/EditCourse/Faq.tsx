import { useTranslation } from 'react-i18next'
import { MdDelete } from 'react-icons/md'

import RingSpinner1 from '@/assets/svgs/spinners/RingSpinner1'
import IconButton from '@/components/Buttons/IconButton'
import SvgIcon from '@/components/Images/SvgIcon'
import { TextInput } from '@/components/Inputs/TextInput'
import Separator from '@/components/Separators/Separator'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ShadowBox from '@/components/ui/ShadowBox'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'

type PropTypes = {
  tabName: string
}

const Faq = ({ tabName }: PropTypes): JSX.Element => {
  const { t } = useTranslation()
  const { currentCourse, setCurrentCourse } = useCourseEditSave()
  const { useUpdateCourseFaq } = useCourseData()
  const { mutateAsync, isLoading } = useUpdateCourseFaq()

  const handleFaqChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (!currentCourse) return
    const { id, value } = event.target
    const updatedFaqs = (currentCourse?.faqs || []).map((faq, i) => {
      if (i === index) {
        return { ...faq, [id]: value }
      }
      return faq
    })
    setCurrentCourse({
      ...currentCourse,
      faqs: updatedFaqs,
    })
  }

  const handleUpdate = async (): Promise<void> => {
    if (!currentCourse) return
    mutateAsync({
      courseId: currentCourse?.id,
      institutionId: currentCourse?.institutionId,
      faqs: currentCourse?.faqs ?? [],
    })
  }

  const SaveButton = (): JSX.Element => {
    return (
      <Button className="self-end" onClick={handleUpdate} disabled={isLoading}>
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

  const handleAddFaq = (): void => {
    if (!currentCourse) return
    setCurrentCourse({
      ...currentCourse,
      faqs: [...(currentCourse.faqs || []), { question: '', answer: '' }],
    })
  }

  const handleDeleteFaq = (index: number): void => {
    if (!currentCourse) return
    const updatedFaq = (currentCourse.faqs || []).filter((_, i) => i !== index)
    setCurrentCourse({
      ...currentCourse,
      faqs: updatedFaq,
    })
  }

  return (
    <Box id={tabName} direction="col">
      <SaveButton />
      <Separator />
      {currentCourse?.faqs &&
        currentCourse.faqs.map((faq, index) => {
          const id = index.toString()
          return (
            <ShadowBox gap="lg" key={id} responsive>
              <IconButton
                style={{ alignSelf: 'flex-end' }}
                size="medium"
                plain
                color="warn"
                icon={<MdDelete />}
                aria-label="Close"
                onClick={() => handleDeleteFaq(index)}
              />
              <TextInput
                value={faq.question ?? ''}
                id="question"
                label={t(`teachingService:faq.question`)}
                onChange={e => handleFaqChange(e, index)}
              />
              <TextInput
                value={faq.answer ?? ''}
                id="answer"
                label={t(`teachingService:faq.answer`)}
                onChange={e => handleFaqChange(e, index)}
              />
            </ShadowBox>
          )
        })}
      <Button variant="outline" className="shadow-md" onClick={handleAddFaq}>
        {t(`teachingService:faq.addQuestionPair`)}
      </Button>
    </Box>
  )
}
export default Faq
