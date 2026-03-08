import LockIcon from '@/assets/svgs/LockIcon'
import RequireIcon from '@/assets/svgs/RequiredIcon'
import SvgIcon from '@/components/Images/SvgIcon'
import { CustomFieldIcon } from '@/pages/Setting/CustomDataField/CustomDataFieldCard'
import { InformationFieldTypes } from '@/types/applicationForm'

type PropTypes = {
  item: InformationFieldTypes
}

const EnrollFormItem = ({ item }: PropTypes): JSX.Element => {
  return (
    <div className="w-full py-2 px-4 flex items-center justify-between gap-3 bg-background-layer-2 border rounded-md mb-4">
      <div className="w-full flex items-center gap-4">
        <CustomFieldIcon field={item.type} />
        <div className="text-xs">{item.question}</div>
      </div>
      <div className="box-row w-1/5 justify-end">
        {item.isRequire && (
          <SvgIcon css={{ marginRight: '$3' }}>
            <RequireIcon />
          </SvgIcon>
        )}
        <div>
          <LockIcon />
        </div>
      </div>
    </div>
  )
}

export default EnrollFormItem
