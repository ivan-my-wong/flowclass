import { MdClose } from 'react-icons/md'

import Box from '../Containters/Box'
import Text from '../Texts/Text'

type DiscountCourseItemProps = {
  img: string
  title: string
  icon: JSX.Element
}

const DiscountCourseItem: React.FC<DiscountCourseItemProps> = ({ img, title, icon }) => {
  // const navigate = useNavigate()
  return (
    <Box
      direction="row"
      justify="start"
      align="center"
      className="bg-backgroundLayer2 hover:bg-backgroundLayer3 w-full p-2 transition-colors"
    >
      <MdClose className="fill-textSubtle cursor-pointer" />
      <img src={img} alt="" style={{ width: '60px', height: '60px' }} />
      <Text>{title}</Text>
      <div style={{ marginLeft: 'auto', marginRight: '10px' }}>{icon}</div>
    </Box>
  )
}

export default DiscountCourseItem
