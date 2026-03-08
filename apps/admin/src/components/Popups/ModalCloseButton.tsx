import { Close } from '@radix-ui/react-dialog'
import { MdOutlineClose } from 'react-icons/md'

import IconButton from '../Buttons/IconButton'

const CloseButton = (): JSX.Element => {
  return (
    <Close asChild>
      <IconButton
        className="!absolute top-2.5 right-2.5"
        plain
        icon={<MdOutlineClose />}
        aria-label="Close"
      />
    </Close>
  )
}

export default CloseButton
