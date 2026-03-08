import { ISvgIconType } from '../../components/Images/SvgIcon'

const PlusIcon = ({ fill }: ISvgIconType) => {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.9785 9.47852H13.5215V2.02148C13.5215 0.905041 12.6164 0 11.5 0C10.3836 0 9.47852 0.905041 9.47852 2.02148V9.47852H2.02148C0.905041 9.47852 0 10.3836 0 11.5C0 12.6164 0.905041 13.5215 2.02148 13.5215H9.47852V20.9785C9.47852 22.095 10.3836 23 11.5 23C12.6164 23 13.5215 22.095 13.5215 20.9785V13.5215H20.9785C22.095 13.5215 23 12.6164 23 11.5C23 10.3836 22.095 9.47852 20.9785 9.47852Z"
        fill={fill}
      />
    </svg>
  )
}

export default PlusIcon
