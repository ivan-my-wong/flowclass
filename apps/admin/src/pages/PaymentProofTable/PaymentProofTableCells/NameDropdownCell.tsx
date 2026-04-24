import { useNavigate } from 'react-router-dom'

import { LuExternalLink } from 'react-icons/lu'

import DropDownCell from '@/components/DropDownMenus/DropDownCell'
import Box from '@/components/ui/Box'
import { PaymentProofTableItem } from '@/types/enrollCourse'

const NameDropdownCell = ({ data }: { data: PaymentProofTableItem }) => {
  const navigate = useNavigate()
  if (!data) {
    return null
  }
  const { phone } = data.userAlias.user ?? {}
  const { email } = data.userAlias

  const { userId, id: aliasId } = data.userAlias ?? { id: 0, userId: 0 }

  const firstEnrollCourse = data.enrollCourses?.[0]
  const displayName =
    firstEnrollCourse?.preferredName ||
    firstEnrollCourse?.name ||
    data.userAlias.name

  const items = [
    { label: 'student:phone', value: phone },
    { label: 'student:email', value: email },
  ]

  return (
    <Box direction="row" gap="sm" align="center" className="my-1">
      <DropDownCell mainText={displayName} items={items} />
      <LuExternalLink
        className="cursor-pointer hover:text-primary"
        onClick={() => {
          navigate(`/student-record/${aliasId}?userId=${userId}`)
        }}
      />
    </Box>
  )
}

export default NameDropdownCell
