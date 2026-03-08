import { useNavigate } from 'react-router-dom'

import { AiOutlineArrowRight } from 'react-icons/ai'
import { BsFillCheckCircleFill } from 'react-icons/bs'

import IconButton from '../../../components/Buttons/IconButton'
import Text from '../../../components/Texts/Text'

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
    <div
      className="flex flex-row rounded-lg border border-shadow p-2 cursor-pointer items-center"
      onClick={() => navigate(link)}
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
      <span className="flex mr-5 items-center [&_.checkIcon]:text-success">
        <BsFillCheckCircleFill
          className={current === target ? 'checkIcon' : ''}
        />
      </span>
      <Text className="flex-grow-[4] hover:underline">{title}</Text>
      <IconButton
        plain
        size="medium"
        color="primary"
        icon={<AiOutlineArrowRight style={{ float: 'right' }} />}
      />
    </div>
  )
}
export default TaskItem
