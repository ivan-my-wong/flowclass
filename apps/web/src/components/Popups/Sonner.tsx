import { LucideAlertCircle, LucideAlertTriangle, LucideCheckCircle } from 'lucide-react'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          '--normal-bg': 'white',
          '--normal-text': '0 0% 3.9%',
          '--normal-border': '0 0% 89.8%',
        } as React.CSSProperties
      }
      icons={{
        success: <LucideCheckCircle className="text-success mr-2 h-5 w-5" />,
        error: <LucideAlertCircle className="text-warn mr-2 h-5 w-5" />,
        warning: <LucideAlertTriangle className="text-secondarySubtle mr-2 h-5 w-5" />,
      }}
      toastOptions={{
        classNames: {
          success: '!text-success !text-[1rem]',
          error: '!text-warn !text-[1rem]',
          warning: '!text-secondarySubtle !text-[1rem]',
        },
      }}
      position="top-right"
      {...props}
    />
  )
}

export { Toaster }
