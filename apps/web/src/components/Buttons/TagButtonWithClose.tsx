import React from 'react'

import { Cross2Icon } from '@radix-ui/react-icons'

type TagButtonWithCloseProps = {
  tagName: string
  isEnable: boolean
  onClick: () => void
}

const TagButtonWithClose = ({
  tagName,
  isEnable,
  onClick,
}: TagButtonWithCloseProps): JSX.Element => {
  return (
    <button
      className={`${
        isEnable
          ? 'text-text  border-text   bg-backgroundLayer3 '
          : 'text-textSubtle  border-textDisabled  bg-tableHoverRowColor hidden'
      }   mr-1.5 w-fit cursor-pointer justify-items-center rounded-xl border px-3 py-1`}
    >
      <div className=" flex flex-row justify-items-center gap-1 whitespace-nowrap text-center text-xs ">
        {isEnable && (
          <div className="hover:bg-tableEvenRowColor flex items-start" onClick={onClick}>
            <Cross2Icon />
          </div>
        )}
        <div className="text-center ">{tagName}</div>
      </div>
    </button>
  )
}

export default TagButtonWithClose
