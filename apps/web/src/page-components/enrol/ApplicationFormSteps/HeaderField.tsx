import Text from '@/components/Texts/Text'

type PropTypes = { question?: string | null }
const HeaderField = ({ question }: PropTypes): JSX.Element => {
  return (
    <div className="box-col-full mt-4 flex flex-col items-stretch">
      <Text className="raw-input-label mb-0 mt-4 text-2xl font-bold">{question}</Text>
    </div>
  )
}

export default HeaderField
