import { useTranslation } from 'react-i18next'
import { AiOutlineClose } from 'react-icons/ai'
import { v4 as uuidv4 } from 'uuid'

import AddIcon from '@/assets/svgs/AddIcon'
import Box from '@/components/Containers/Box'
import {
  DraggableCard,
  DraggableContainer,
} from '@/components/Containers/Draggable'
import SvgIcon from '@/components/Images/SvgIcon'
import TextInput from '@/components/Inputs/TextInput'

import { AnswerProps } from '../CreateNewFieldComponent'

const CreateNewFieldMultipleChoice = ({
  isEdit,
  answers,
  setAnswers,
}: {
  isEdit: boolean
  answers: AnswerProps[]
  setAnswers: React.Dispatch<React.SetStateAction<AnswerProps[]>>
}): React.ReactElement => {
  const { t } = useTranslation()

  /** Following are for those with multiple choices like dropdown and multiple choices */
  // There is a potential bug that if the user add a new answer without any text, it might but out the front end. However, I haven't tested it yet.
  const handleAddAnswer = () => {
    if (!isEdit) {
      setAnswers(prevAnswers => [...prevAnswers, { id: uuidv4(), name: '' }])
    }
  }
  const handleRemoveAnswer = (index: number) => {
    const newAnswer = answers.filter((el, key: number) => key !== index)
    setAnswers(newAnswer)
  }
  const setValueAnswer = (index: number, value: string) => {
    const newAnswer = [...answers]
    newAnswer[index].name = value
    setAnswers(newAnswer)
  }
  const handleDragEnd = (value: AnswerProps[]) => {
    setAnswers(value)
  }

  return (
    <Box direction="column" align="flex-start" css={{ marginTop: '$6' }}>
      <Box justify="space-between">
        <Box justify="flex-start">
          <p className="font-bold">{t('setting:studentInformation.option')}</p>
        </Box>
        {!isEdit && (
          <Box
            css={{ color: '$primary', cursor: 'pointer' }}
            justify="flex-end"
            onClick={() => handleAddAnswer()}
            data-testid="add-option"
          >
            <SvgIcon>
              <AddIcon />
            </SvgIcon>
            {t('setting:studentInformation.addOption')}
          </Box>
        )}
      </Box>
      {answers && answers.length > 0 && (
        <Box direction="column">
          <DraggableContainer handleDragEnd={handleDragEnd} items={answers}>
            {answers &&
              answers.length > 0 &&
              answers.map((answer, index: number) => {
                return (
                  <DraggableCard
                    key={answer.id}
                    id={answer.id}
                    cardStyle={{
                      background: '$background',
                      padding: '$3',
                      display: 'grid',
                      gridTemplateColumns: '9% 90%',
                    }}
                  >
                    <Box>
                      <TextInput
                        disabled={isEdit}
                        defaultValue={answer.name}
                        onChange={e => setValueAnswer(index, e.target.value)}
                        dataTestId={`option-${index + 1}`}
                      />
                      <SvgIcon
                        onClick={() => !isEdit && handleRemoveAnswer(index)}
                      >
                        <AiOutlineClose />
                      </SvgIcon>
                    </Box>
                  </DraggableCard>
                )
              })}
          </DraggableContainer>
        </Box>
      )}
    </Box>
  )
}

export default CreateNewFieldMultipleChoice
