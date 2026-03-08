import { ComponentPropsWithRef, forwardRef } from 'react'

import { useTranslation } from 'react-i18next'
import PI from 'react-phone-input-2'
import { useRecoilValue } from 'recoil'

import Text from '@/components/ui/Text'
import { useUserCountry } from '@/hooks/useLocalization'
import { siteState } from '@/stores/siteData'
import { cn } from '@/utils/cn'
import { countryNameToCode } from '@/utils/convert'

import 'react-phone-input-2/lib/style.css'

const PhoneInput = (PI as any).default ?? PI
type PhoneNumberInputProps = {
  ['data-testid']?: string
  field: any
  fullWidth?: boolean
  error?: boolean
  errorMessage?: string
  className?: string
} & ComponentPropsWithRef<typeof PhoneInput>

const PhoneNumberInput = forwardRef(
  (
    {
      field,
      fullWidth,
      error,
      errorMessage,
      'data-testid': dataTestId,
      className,
      ...props
    }: PhoneNumberInputProps,
    ref
  ) => {
    const { t } = useTranslation()
    const [country] = useUserCountry()
    const { currentSite } = useRecoilValue(siteState)

    return (
      <div className={cn('w-full', className)}>
        <PhoneInput
          {...props}
          inputId="phone"
          inputStyle={{
            width: fullWidth ? '100%' : 'auto',
            ...props.inputStyle,
          }}
          inputProps={{
            ref,
            'data-testid': dataTestId,
            id: 'phone',
            className:
              'border border-input bg-background pl-12 rounded-md text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
          }}
          country={(
            (currentSite?.country
              ? countryNameToCode(currentSite?.country)
              : country || 'HK') as string
          ).toLowerCase()}
          {...field}
          {...props}
        />
        {errorMessage && (
          <Text
            variant={error ? 'error' : undefined}
            className="mt-0 text-left text-sm"
          >
            {errorMessage}
          </Text>
        )}
      </div>
    )
  }
)

export default PhoneNumberInput
