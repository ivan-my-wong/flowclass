import { cn } from '@/utils/cn'

import { useResponsive } from '../../hooks/useResponsive'
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
      type="button"
      className={cn(
        'cursor-pointer flex justify-items-center rounded border-0 px-3 py-1 bg-background-layer-3',
        (isMobile || isTablet) && 'w-full'
      )}
      onClick={onClick}
    >
      {/* <div className=" flex flex-row justify-items-center gap-1 whitespace-nowrap text-center text-xs "> */}
      {/*  <Text>{variableName}</Text> */}
      {/* </div> */}

      <Box justify="center" className="justify-items-center whitespace-nowrap">
        <Text size="extraSmall" align="center">
          {variableName}
        </Text>
      </Box>
    </button>
  )
}

export default TemplateVariableButton
