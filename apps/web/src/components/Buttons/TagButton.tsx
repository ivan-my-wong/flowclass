import { AiOutlineCheckCircle } from 'react-icons/ai'

type TagButtonProps = {
  tagName: string
  isEnable: boolean
  onClick: () => void
}

const TagButton = ({ tagName, isEnable, onClick }: TagButtonProps): JSX.Element => {
  return (
    <button
      className={`${
        isEnable
          ? 'text-text  border-text   bg-backgroundLayer3 hover:bg-tableEvenRowColor'
          : 'text-textSubtle  border-textDisabled  bg-tableHoverRowColor '
      }   mr-1.5 w-fit cursor-pointer justify-items-center rounded-xl border px-3 py-1`}
      onClick={onClick}
    >
      <div className=" flex flex-row justify-items-center gap-1 whitespace-nowrap text-center text-xs ">
        {isEnable && (
          <div className="flex items-center">
            <AiOutlineCheckCircle />
          </div>
        )}
        <div className="text-center ">{tagName}</div>
      </div>
    </button>
  )
}

export default TagButton
