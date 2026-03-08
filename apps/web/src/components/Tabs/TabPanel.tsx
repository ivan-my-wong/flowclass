interface TabPanelProps {
  tabName: string
  children: React.ReactNode
  className?: string
  // handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const TabPanel = ({ tabName, className, children }: TabPanelProps): JSX.Element => {
  return (
    <div id={tabName} className={`flex w-full flex-col ${className}`}>
      {children}
    </div>
  )
}

export default TabPanel
