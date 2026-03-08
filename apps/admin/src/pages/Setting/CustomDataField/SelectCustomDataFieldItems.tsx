const TabSelectLabel = ({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string | React.ReactNode
}): React.ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '200px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '40px',
          marginRight: '10px',
        }}
      >
        {icon}
      </div>
      {label}
    </div>
  )
}

export default TabSelectLabel
