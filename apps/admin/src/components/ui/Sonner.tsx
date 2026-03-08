import { useTheme } from 'next-themes'
import { LuAlertCircle, LuAlertTriangle, LuCheckCircle } from 'react-icons/lu'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'white',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      icons={{
        success: <LuCheckCircle className="h-5 w-5 text-success mr-2" />,
        error: <LuAlertCircle className="h-5 w-5 text-destructive mr-2" />,
        warning: <LuAlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />,
      }}
      toastOptions={{
        classNames: {
          success: '!text-success !text-[1rem]',
          error: '!text-destructive !text-[1rem]',
          warning: '!text-yellow-600 !text-[1rem]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
