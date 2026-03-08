import Text from '@/components/Texts/Text'

type PropTypes = { question?: string | null; description?: string | null }
const DescriptionField = ({ question, description }: PropTypes): JSX.Element => {
  return (
    <div className="box-col-full flex flex-col items-stretch">
      <Text className="raw-input-label mb-0 mt-4 text-2xl font-bold">{question}</Text>
      {!!question && (
        <Text className="raw-input-label text-text text-md mb-0 mt-4 whitespace-pre-line">
          {description}
        </Text>
      )}
    </div>
  )
}

export default DescriptionField
