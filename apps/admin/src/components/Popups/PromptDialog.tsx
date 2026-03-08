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
import { useTranslation } from 'react-i18next'
import { IoMdAdd, IoMdClose } from 'react-icons/io'

import { cn } from '@/utils/cn'

import Button from '../Buttons/Button'
import IconButton from '../Buttons/IconButton'
import { TextInput } from '../Inputs/TextInput'

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
          onClick={() => setOpen(true)}
          plain
          icon={<IoMdAdd />}
          color="primary"
        />
      </Trigger>
      <Portal>
        <Overlay
          className="fixed inset-0 animate-dialog-overlay"
          style={{ backgroundColor: blackA.blackA9 }}
        />
        <Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[90vw] max-w-[450px] max-h-[85vh] p-6 rounded-md bg-white',
            'shadow-[hsl(206_22%_7%/35%)_0px_10px_38px_-10px,hsl(206_22%_7%/20%)_0px_10px_20px_-15px]',
            'animate-dialog-content',
            'focus:outline-none'
          )}
        >
          <Title
            className="m-0 font-medium text-[17px]"
            style={{ color: mauve.mauve12 }}
          >
            {title ?? 'Prompt Title'}
          </Title>
          <Description
            className="my-2.5 mb-5 text-[15px] leading-[1.5]"
            style={{ color: mauve.mauve11 }}
          >
            {desc ?? 'Prompt Desc'}
          </Description>
          <TextInput
            id="name"
            defaultValue={defaultValue}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <div className="flex justify-end mt-6">
            <Button className="m-1.5 bg-[#BBBBBB]" onClick={closeModal}>
              {t('common:action.cancel')}
            </Button>
            <Button
              className="m-1.5"
              onClick={() => {
                onCreate(value)
                closeModal()
              }}
            >
              {t('common:action.saveChanges')}
            </Button>
          </div>
          <Close asChild>
            <IconButton
              aria-label="Close"
              onClick={closeModal}
              icon={<IoMdClose />}
              className="absolute top-2.5 right-2.5"
              plain
            />
          </Close>
        </Content>
      </Portal>
    </Root>
  )
}

export default PromptDialog
