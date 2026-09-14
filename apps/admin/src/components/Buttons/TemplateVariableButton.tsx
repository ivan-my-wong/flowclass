import { useResponsive } from '../../hooks/useResponsive'
import { theme } from '../../styles'
import Box from '../Containers/Box'
import Text from '../Texts/Text'

type TemplateVariableButtonProps = {
  variableName: string
  onClick: () => void
}

const TemplateVariableButton = ({
  variableName,
  onClick,
}: TemplateVariableButtonProps): JSX.Element => {
  const { isMobile, isTablet } = useResponsive()
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      style={{
        cursor: 'pointer',
        justifyItems: 'center',
        borderRadius: '0.25rem',
        background: theme.colors.backgroundLayer3.toString(),
        border: 0,
        padding: '0.25rem  0.75rem',
        width: isMobile || isTablet ? '100%' : 'auto',
      }}
      onClick={onClick}
    >
      {/* <div className=" flex flex-row justify-items-center gap-1 whitespace-nowrap text-center text-xs "> */}
      {/*  <Text>{variableName}</Text> */}
      {/* </div> */}

      <Box
        css={{
          justifyItems: 'center',
          whiteSpace: 'noWrap',
        }}
        justify="center"
      >
        <Text css={{ fontSize: '$2' }} align="center">
          {variableName}
        </Text>
      </Box>
    </button>
  )
}

export default TemplateVariableButton
