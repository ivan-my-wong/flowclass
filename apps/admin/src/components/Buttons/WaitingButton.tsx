import { ComponentProps, useState } from 'react'

import Button from './Button'

type WaitingButtonProps = {
  btnText: string
  onClick: () => void
} & ComponentProps<typeof Button>

const WaitingButton = ({
  btnText,
  onClick,
  ...props
}: WaitingButtonProps): JSX.Element => {
  const [isClicked, setIsClicked] = useState<boolean>(false)
  const [remainingTime, setRemainingTime] = useState<number>(60)

  const handleBtnClick = () => {
    setIsClicked(true)
    setRemainingTime(60)

    const timer = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime === 1) {
          setIsClicked(false)
          clearInterval(timer)
          return 60
        }
        return prevTime - 1
      })
    }, 1000)
    onClick()
  }
  return (
    <Button {...props} disabled={isClicked} onClick={handleBtnClick}>
      {btnText} {isClicked ? `(${remainingTime}s)` : ''}
    </Button>
  )
}

export default WaitingButton
