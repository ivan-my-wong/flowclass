import { Close } from '@radix-ui/react-dialog'
import { MdOutlineClose } from 'react-icons/md'

import { styled } from '../../styles'
import IconButton from '../Buttons/IconButton'

const StyledClose = styled(IconButton, {
  position: 'absolute!important',
  top: 10,
  right: 10,
})

const CloseButton = (): JSX.Element => {
  return (
    <Close asChild>
      <StyledClose plain icon={<MdOutlineClose />} aria-label="Close" />
    </Close>
  )
}

export default CloseButton
