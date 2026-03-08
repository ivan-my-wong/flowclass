import React from 'react'

import { LuTrash2 } from 'react-icons/lu'

const FormFieldWrapper = ({
  children,
  onDelete,
  disabled,
  'data-testid': dataTestId,
}: {
  children: React.ReactNode
  onDelete: () => void
  disabled?: boolean
  'data-testid'?: string
}) => {
  return (
    <div className="flex flex-row w-full" data-testid={dataTestId}>
      {children}
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="text-red-500 enabled:hover:opacity-50 disabled:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
      >
        <LuTrash2 size={20} />
      </button>
    </div>
  )
}

export default FormFieldWrapper
