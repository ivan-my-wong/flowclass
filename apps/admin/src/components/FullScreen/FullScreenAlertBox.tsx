import { MdErrorOutline } from 'react-icons/md'

import AlertBox from '../Boxes/AlertBox'

interface FullScreenAlertBoxProps {
  text: string
  content?: JSX.Element
}

const FullScreenAlertBox: React.FC<FullScreenAlertBoxProps> = ({
  text,
  content,
}) => {
  return (
    <div className="box-col-full p-4">
      <AlertBox size="medium" icon={<MdErrorOutline />} content={text} />
      {content}
    </div>
  )
}

export default FullScreenAlertBox
