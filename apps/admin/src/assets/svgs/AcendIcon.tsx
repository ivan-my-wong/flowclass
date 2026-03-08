import { ISvgIconType } from '../../components/Images/SvgIcon'

const AcendIcon = ({ fill }: ISvgIconType) => {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 8L0.669873 0.500001L9.33013 0.500001L5 8Z" fill={fill} />
    </svg>
  )
}

export default AcendIcon
