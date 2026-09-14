import { useState } from 'react'

import { blackA, mauve } from '@radix-ui/colors'
import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog'
import { keyframes } from '@stitches/react'
import { useTranslation } from 'react-i18next'
import { IoMdAdd, IoMdClose } from 'react-icons/io'

import { styled } from '../../styles'
import Button from '../Buttons/Button'
import IconButton from '../Buttons/IconButton'
import { TextInput } from '../Inputs/TextInput'

// import { useTranslation } from 'react-i18next' // TODO: Add translations

type DialogArgs = {
  /** Main Display Text */
  title: string
  /** Minor Display Text */
  desc?: string
  /** Default Section Title Value */
  defaultValue?: string
  /** Method: Require a key value for creating new section */
  onCreate: (value: string) => void
}
const PromptDialog = ({ title, desc, defaultValue, onCreate }: DialogArgs) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue ?? '')
  const closeModal = () => {
    setOpen(false)
    setValue(defaultValue ?? '')
  }

  return (
    <Root open={open}>
      <Trigger asChild>
        <IconButton
          onClick={() => {
            setOpen(true)
          }}
          plain
          icon={<IoMdAdd />}
          color="primary"
        />
      </Trigger>
      <Portal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>{title ?? 'Prompt Title'}</DialogTitle>
          <DialogDescription>{desc ?? 'Prompt Desc'}</DialogDescription>
          <TextInput
            id="name"
            defaultValue={defaultValue}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <Flex css={{ marginTop: 25, justifyContent: 'flex-end' }}>
            <Button
              css={{ margin: 5, backgroundColor: '#BBBBBB' }}
              onClick={closeModal}
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              css={{ margin: 5 }}
              onClick={() => {
                onCreate(value)
                closeModal()
              }}
            >
              {t('common:action.saveChanges')}
            </Button>
          </Flex>
          <Close asChild>
            <IconButton
              aria-label="Close"
              onClick={closeModal}
              icon={<IoMdClose />}
              css={{ position: 'absolute', top: 10, right: 10 }}
              plain
            />
          </Close>
        </DialogContent>
      </Portal>
    </Root>
  )
}

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const DialogOverlay = styled(Overlay, {
  backgroundColor: blackA.blackA9,
  position: 'fixed',
  inset: 0,
  animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
})

const DialogContent = styled(Content, {
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  padding: 25,
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '&:focus': { outline: 'none' },
})

const DialogTitle = styled(Title, {
  margin: 0,
  fontWeight: 500,
  color: mauve.mauve12,
  fontSize: 17,
})

const DialogDescription = styled(Description, {
  margin: '10px 0 20px',
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
})

const Flex = styled('div', { display: 'flex' })

export default PromptDialog
