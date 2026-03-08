import flowclassLogo from '@/assets/logos/flowclass.png'

import ImageAspect from '../Images/ImageAspect'
import { Spinner } from '../Loaders/Spinner'
import Box from '../ui/Box'

const FullScreenLoading: React.FC = () => {
  return (
    <Box
      direction="col"
      align="center"
      justify="center"
      className="w-full h-full"
    >
      <ImageAspect
        ratio={5.4 / 1}
        width="20%"
        src={flowclassLogo}
        alt="Flowclass"
      />
      <Spinner />
    </Box>
  )
}

export default FullScreenLoading
