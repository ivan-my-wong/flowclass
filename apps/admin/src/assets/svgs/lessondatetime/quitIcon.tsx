import { ISvgIconType } from '../../../components/Images/SvgIcon'

const QuitIcon = ({ fill }: ISvgIconType) => {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4628 11.7859L10.8206 7.36686L15.4628 2.9478L12.3691 0L7.7314 4.42117L3.09145 0L0 2.9478L4.63773 7.36686L0 11.7859L3.09145 14.7337L7.7314 10.3126L12.3691 14.7337L15.4628 11.7859Z"
        fill={fill || '#BFBFBF'}
      />
    </svg>
  )
}

export default QuitIcon
