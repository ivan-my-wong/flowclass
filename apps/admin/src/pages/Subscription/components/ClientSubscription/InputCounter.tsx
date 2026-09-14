import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'

interface Props {
  count: number
  priceLabel: string
  setCount: (value: number) => void
}
const InputCounter: React.FC<Props> = ({
  count,
  priceLabel,
  setCount,
}): JSX.Element => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        onClick={() => {
          if (count > 1) {
            setCount(count - 1)
          }
        }}
      >
        -
      </Button>
      <div>
        <Input
          type="number"
          min={1}
          value={count}
          onChange={e => {
            const value = Number(e.target.value)
            // eslint-disable-next-line no-restricted-globals
            if (!isNaN(value) && value >= 0) {
              setCount(value)
            }
          }}
          className="border-gray-300 text-3xl font-semibold pr-0 !w-28 text-center bg-transparent border-none"
        />
        <div className="text-center text-gray-500 text-sm">{priceLabel}</div>
      </div>
      <Button variant="outline" onClick={() => setCount(count + 1)}>
        +
      </Button>
    </div>
  )
}

export default InputCounter
