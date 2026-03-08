import { useTranslation } from 'react-i18next'
import { LuSend } from 'react-icons/lu'

import { TextInput } from '@/components/Inputs/TextInput'
import Separator from '@/components/Separators/Separator'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'

const SendWhatsappMessage = (): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box direction="col" gap="lg">
      <Box>
        <TextInput
          id="token"
          value=""
          placeholder="Enter your WhatsApp API token"
          label="Whatsapp api token"
        />
      </Box>
      <Separator />
      <Box>
        <TextInput
          id="sid"
          value=""
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          label="Whatsapp api sid"
        />
      </Box>
      <Box>
        <TextInput
          id="phone number"
          value="+14155238886"
          label="Phone number (sender)"
        />
      </Box>
      <Box>
        <TextInput
          id="phone number"
          value=""
          placeholder="+1234567890"
          label="Phone number (receiver)"
        />
      </Box>

      <Box direction="col">
        <TextInput
          id="message"
          value="Hello! We are {{schoolName}}. This is a friendly reminder."
          label="Message"
        />
        <Button className="self-end px-10 mt-2 gap-x-2">
          <LuSend />
          {t('common:action.send')}
        </Button>
      </Box>
    </Box>
  )
}

export default SendWhatsappMessage
