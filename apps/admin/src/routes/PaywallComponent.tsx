import { ReactElement } from 'react'

interface IPaywallComponentProps {
  planKey?: string
  planValue?: number | string | boolean
  fallback?: ReactElement
  children: ReactElement
}

const PaywallComponent: React.FC<IPaywallComponentProps> = ({ children }) =>
  children

export default PaywallComponent
