import { MdClose } from 'react-icons/md'

import Box from '../../../components/Containers/Box'
import Text from '../../../components/Texts/Text'
import { theme } from '../../../styles'

type DiscountCourseItemProps = {
  img: string
  title: string
  icon: JSX.Element
}

const DiscountCourseItem: React.FC<DiscountCourseItemProps> = ({
  img,
  title,
  icon,
}) => {
  // const navigate = useNavigate()
  return (
    <Box
      direction="row"
      justify="flex-start"
      align="center"
      css={{
        backgroundColor: '$backgroundLayer2',
        width: '100%',
        transition: 'background-color 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: '$backgroundLayer3',
        },
      }}
      padding="small"
    >
      <MdClose className="cursor-pointer text-text-subtle" />
      <img src={img} alt="" style={{ width: '60px', height: '60px' }} />
      <Text>{title}</Text>
      <div style={{ marginLeft: 'auto', marginRight: '10px' }}>{icon}</div>
    </Box>
  )
}

export default DiscountCourseItem
