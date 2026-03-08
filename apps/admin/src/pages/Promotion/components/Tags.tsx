import React, { useEffect, useState } from 'react'

import Box from '@/components/Containers/Box'
import { DynamicTypeSelectorItemProps } from '@/components/Selector/Select'
import Text from '@/components/Texts/Text'
import { AmountCoupons, PercentageAmountCoupons } from '@/constants/coupon'
import { DiscountType } from '@/types/coupon'

type ItemProps<T> = DynamicTypeSelectorItemProps<T> & {
  id: number
  customize: boolean
}
type TagProps<T> = {
  items: ItemProps<T>[]
  condition?: string
  discountType?: string
  defaultValue?: T
  disable?: boolean
  currentValue?: T
  onActionClick?: (value: T) => void
  onActionCustomize?: (value: boolean) => void
}

const Tags = <T,>({
  items,
  defaultValue,
  currentValue,
  condition,
  discountType,
  disable = false,
  onActionClick = () => {},
  onActionCustomize = () => {},
}: TagProps<T>): React.ReactElement => {
  const [active, setActive] = useState(defaultValue || -1)
  const handleChangeOption = (item: ItemProps<T>) => {
    if (disable === false) {
      onActionClick(item.value)
      setActive(item.id)
      onActionCustomize(item.customize)
    }
  }
  useEffect(() => {
    if (discountType) {
      const indexValue = items.find(el => el.value === currentValue)
      if (indexValue) {
        setActive(indexValue.id)
        onActionClick(indexValue.value)
      } else {
        if (discountType === DiscountType.PERCENTAGE) {
          setActive(2)
          onActionClick(PercentageAmountCoupons[1].value as unknown as T)
        } else {
          setActive(300)
          onActionClick(AmountCoupons[2].value as unknown as T)
        }
        onActionCustomize(false)
      }
    }
  }, [discountType])

  useEffect(() => {
    if (defaultValue) {
      const indexValue = items.find(el => el.value === defaultValue)
      if (indexValue) {
        setActive(indexValue.id)
      } else {
        setActive(items[items.length - 1].id)
        onActionCustomize(items[items.length - 1].customize)
      }
      if (condition) {
        setActive(-1)
        onActionCustomize(true)
      }
    } else {
      setActive(1)
      onActionClick(items[0].value)
      onActionCustomize(false)
    }
  }, [])

  return (
    <Box
      justify="flex-start"
      css={{
        flexWrap: 'wrap',
        gap: '$1',
        backgroundColor:
          active === items[items.length - 1].id
            ? '$backgroundLayer2'
            : '$white',
      }}
    >
      {items.map(item => {
        return (
          <Text
            data-testid={`tag-${item.label.toLowerCase()}`}
            css={{
              border: active === item.id ? '2px solid $primary' : '1px',
              color: active === item.id ? '$primary' : '$textSub',
              fontWeight: active === item.id ? 'bold' : 'normal',
              background: active === item.id ? '$white' : '$backgroundLayer3',
              borderRadius: '$large',
              padding: '5px $5',
              fontSize: '$small',
              cursor: 'pointer',
            }}
            key={item.id}
            onClick={() => handleChangeOption(item)}
          >
            {item.label}
          </Text>
        )
      })}
    </Box>
  )
}
export default Tags
