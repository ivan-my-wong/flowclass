import { AiOutlineClose } from 'react-icons/ai'

import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { AdminSchool } from '@/types/school'

type PropTypes = {
  data: AdminSchool
  handleDelete: () => void
}
const AdminElement = ({ data, handleDelete }: PropTypes): JSX.Element => {
  return (
    <Box justify="between">
      <Text>{data.email}</Text>
      <SvgIcon onClick={handleDelete}>
        <AiOutlineClose />
      </SvgIcon>
    </Box>
  )
}

export default AdminElement
