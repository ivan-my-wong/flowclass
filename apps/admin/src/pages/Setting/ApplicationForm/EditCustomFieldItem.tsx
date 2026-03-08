import DeleteIcon from '@/assets/svgs/DeleteIcon'
import LockIcon from '@/assets/svgs/LockIcon'
import RequireIcon from '@/assets/svgs/RequiredIcon'
import Box from '@/components/Containers/Box'
import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import { InformationFieldTypes } from '@/types/applicationForm'
import { CustomDataFieldColumnMapping } from '@/types/enrollCourse'
import { StudentPrimaryIdentifier } from '@/types/school'
import { generateDataTestId } from '@/utils/data-testid.utils'

import { CustomFieldIcon } from '../CustomDataField/CustomDataFieldCard'

interface Props {
  data: InformationFieldTypes
  handleDeleteField?: (id: number) => void
  studentPrimaryIdentifier?: StudentPrimaryIdentifier
}
const FieldCard = ({
  data,
  handleDeleteField,
  studentPrimaryIdentifier,
}: Props) => {
  const handleDelete = () => {
    if (handleDeleteField && data.id) {
      handleDeleteField(data.id)
    }
  }

  const isRequired = () => {
    if (data.isDefault) {
      if (
        studentPrimaryIdentifier &&
        data.columnMapping === CustomDataFieldColumnMapping.EMAIL
      ) {
        return studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL
      }

      return true
    }

    return data.isRequire
  }

  return (
    <Box
      justify="space-between"
      css={{ background: '$backgroundLayer2', borderRadius: '$1' }}
      padding="medium"
    >
      <Box
        css={{ width: '80%', textOverflow: 'ellipsis' }}
        justify="flex-start"
      >
        <CustomFieldIcon field={data.type || ''} />
        <Text css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.question}
        </Text>
      </Box>
      <Box css={{ width: '20%' }} justify="flex-end">
        {isRequired() && (
          <SvgIcon css={{ marginLeft: '$3' }}>
            <RequireIcon />
          </SvgIcon>
        )}

        {data.isDefault ? (
          <SvgIcon css={{ marginLeft: '$3' }}>
            <LockIcon />
          </SvgIcon>
        ) : (
          <SvgIcon
            css={{ marginLeft: '$3', cursor: 'pointer' }}
            onClick={() => handleDelete()}
            data-testid={`${generateDataTestId('delete-field', data.question)}`}
          >
            <DeleteIcon fill="#F87575" />
          </SvgIcon>
        )}
      </Box>
    </Box>
  )
}
export default FieldCard
