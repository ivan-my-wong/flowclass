import ImageAspect from '@/components/Images/ImageAspect'

const PaymentDetailElement = ({
  fieldKey,
  value,
}: {
  fieldKey: string
  value: string | boolean
}): JSX.Element => {
  if (typeof value === 'boolean') {
    return <div className="w-auto">{value ? 'Yes' : 'No'}</div>
  }
  switch (true) {
    // is image
    case fieldKey === 'payoutImg':
      return (
        <div className="w-full">
          <ImageAspect s3="private" src={value} alt={fieldKey} className="h-auto w-full" />
        </div>
      )
    // is link
    case /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value):
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary break-all underline underline-offset-4"
        >
          {value}
        </a>
      )
    // is default
    default:
      return <div className="w-auto">{value}</div>
  }
}
export default PaymentDetailElement
