import { useNavigate } from 'react-router-dom'

import { styled } from '@stitches/react'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { BsFillCheckCircleFill } from 'react-icons/bs'

import IconButton from '../../../components/Buttons/IconButton'
import Text from '../../../components/Texts/Text'

const TaskBox = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '0.5rem',
  borderStyle: 'solid',
  padding: '$2 0',
  borderColor: '$shadowColor',
  alignItems: 'center',
  cursor: 'pointer',
})

const ToDoItem = styled('span', {
  display: 'flex',
  marginRight: '$5',
  alignItems: 'center',

  '.checkIcon': {
    color: '$success',
  },
})
const StyledText = styled(Text, {
  flexGrow: 4,
  '&:hover': {
    textDecoration: 'underline',
  },
})
TaskBox.displayName = 'TaskBox'
ToDoItem.displayName = 'ToDoItem'
const TaskItem = ({
  title,
  link,
  current,
  target,
}: {
  title: string
  link: string
  current: number
  target: number
}): JSX.Element => {
  const navigate = useNavigate()
  return (
    <TaskBox
      onClick={() => {
        navigate(link)
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(link)
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Navigate to ${title}`}
    >
      <ToDoItem>
        <BsFillCheckCircleFill
          className={current === target ? 'checkIcon' : ''}
        />
      </ToDoItem>
      <StyledText>{title}</StyledText>
      <IconButton
        plain
        size="medium"
        color="primary"
        icon={<AiOutlineArrowRight style={{ float: 'right' }} />}
      />
    </TaskBox>
  )
}
export default TaskItem
