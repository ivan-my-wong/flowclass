import React, { ComponentPropsWithoutRef } from 'react'

import {
  Arrow,
  CheckboxItem,
  Content,
  Item,
  ItemIndicator,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from '@radix-ui/react-dropdown-menu'
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons'
import { CSS } from '@stitches/react'
import { useTranslation } from 'react-i18next'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdNotifications } from 'react-icons/io'

import { keyframes, styled } from '../../styles'
import Box from '../Containers/Box'
import SvgIcon from '../Images/SvgIcon'
import Text from '../Texts/Text'
import LanguageToggle from '../Toggle/LanguageToggle'
import Tooltip from '../Tooltips/Tooltip'

type MenuItemProps = {
  id?: string
  disabled?: boolean
  content: string | React.ReactNode
  rightContent?: React.ReactNode
  isHidden?: boolean
  onClick?: () => void
  tooltip?: string
  dataTestId?: string
}

type LabelMenuItemProps = {
  label: string
}

type SubMenuItemProps = {
  content: string | React.ReactNode
  items: MenuItemProps[]
}

type CheckboxMenuItemProps = {
  content: string | React.ReactNode
  rightContent?: string | React.ReactNode
  checked?: boolean
  onCheckedChange?: () => void
}

type RadioMenuItemProps = {
  value: string
  onSelectChange?: () => void
  items: {
    value: string
    content: string
    rightContent?: string | React.ReactNode
  }[]
}

export type DropDownMenuItemType =
  | (MenuItemProps & { type: 'item' })
  | (MenuItemProps & { type: 'plainItem' })
  | (LabelMenuItemProps & { type: 'label' })
  | (SubMenuItemProps & { type: 'sub' })
  | (CheckboxMenuItemProps & { type: 'checkbox' })
  | (RadioMenuItemProps & { type: 'radio' })
  | { type: 'beamer' }
  | { type: 'language' }
  | { type: 'separator' }

type DropdownMenuProps = {
  menuItems: DropDownMenuItemType[]
  trigger?: JSX.Element
  contentProps?: CSS
  triggerProps?: CSS
  dataTestId?: string
  triggerType?: 'click' | 'hover'
  sideOffset?: number
} & ComponentPropsWithoutRef<'div'>

const MenuItem = ({
  id,
  disabled,
  onClick,
  content,
  rightContent,
  isHidden,
  tooltip,
  dataTestId,
}: MenuItemProps): JSX.Element => {
  if (!isHidden) {
    const component = (
      <div>
        <StyledItem
          id={id ?? ''}
          disabled={disabled}
          data-testid={dataTestId}
          onSelect={e => {
            e.stopPropagation()
            onClick?.()
          }}
          className="gap-0"
        >
          {content}
          {rightContent && <RightSlot>{rightContent}</RightSlot>}
        </StyledItem>
      </div>
    )
    return (
      <>
        {tooltip ? (
          <Tooltip trigger={component}>
            <div>{tooltip}</div>
          </Tooltip>
        ) : (
          component
        )}
      </>
    )
  }
  return <></>
}

const MenuLabel = ({ label }: LabelMenuItemProps): JSX.Element => {
  return <StyledLabel>{label}</StyledLabel>
}

const MenuSeparator = (): JSX.Element => {
  return <StyledSeparator />
}

const MenuSubMenu = ({ content, items }: SubMenuItemProps): JSX.Element => {
  return (
    <Sub>
      <StyledSubTrigger>
        {content}
        <RightSlot>
          <ChevronRightIcon />
        </RightSlot>
      </StyledSubTrigger>
      <Portal>
        <StyledSubContent sideOffset={2} alignOffset={-5}>
          {items.map((item, index) => {
            const id = index.toString()
            return <MenuItem key={id} {...item} />
          })}
        </StyledSubContent>
      </Portal>
    </Sub>
  )
}

const MenuCheckBoxItem = ({
  content,
  rightContent,
  checked,
  onCheckedChange,
}: CheckboxMenuItemProps): JSX.Element => {
  return (
    <StyledCheckboxItem checked={checked} onCheckedChange={onCheckedChange}>
      <StyledItemIndicator>
        <CheckIcon />
      </StyledItemIndicator>
      {content}
      {rightContent && <RightSlot>{rightContent}</RightSlot>}
    </StyledCheckboxItem>
  )
}

const MenuRadioGroup = ({
  value,
  onSelectChange,
  items,
}: RadioMenuItemProps): JSX.Element => {
  return (
    <RadioGroup value={value} onValueChange={onSelectChange}>
      {items.map((item, index) => {
        const id = item.value ?? index.toString()
        return (
          <StyledRadioItem value={item.value} key={id}>
            <StyledItemIndicator>
              <DotFilledIcon />
            </StyledItemIndicator>
            {item.content}
            {item.rightContent && <RightSlot>{item.rightContent}</RightSlot>}
          </StyledRadioItem>
        )
      })}
    </RadioGroup>
  )
}

const DropdownMenu = ({
  trigger,
  menuItems,
  contentProps,
  triggerProps,
  className,
  dataTestId,
  triggerType = 'click',
  sideOffset = 5,
}: DropdownMenuProps): JSX.Element => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const handleOnMouseOver = () => {
    if (triggerType === 'hover') {
      setOpen(true)
    }
  }

  const handleOnMouseLeave = () => {
    if (triggerType === 'hover') {
      setOpen(false)
    }
  }

  return (
    <Root modal open={open} onOpenChange={setOpen}>
      {trigger ? (
        <Trigger
          onMouseOver={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
        >
          {trigger}
        </Trigger>
      ) : (
        <StyledTrigger
          asChild
          onMouseOver={handleOnMouseOver}
          aria-label="Open Menu"
          title="Open Menu"
        >
          <div
            id="dropdownMenu"
            data-testid={dataTestId ?? 'toggle-dropdown'}
            className={className}
          >
            <GiHamburgerMenu className="h-5 w-5" />
          </div>
        </StyledTrigger>
      )}

      <Portal>
        <StyledContent
          className="!border-gray-50 !shadow-xl divide-y divide-gray-300"
          sideOffset={sideOffset || 5}
          css={contentProps}
          onMouseEnter={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
        >
          {menuItems.map((menuItem, index) => {
            const id = `option-${index}`

            switch (menuItem.type) {
              case 'item':
                return (
                  <MenuItem
                    data-testid="dropdown-option"
                    id={id}
                    disabled={menuItem.disabled}
                    onClick={menuItem.onClick}
                    content={menuItem.content}
                    rightContent={menuItem.rightContent}
                    isHidden={menuItem.isHidden}
                    tooltip={menuItem.tooltip}
                    key={id}
                  />
                )
              case 'plainItem':
                return (
                  <Box padding="medium" key={id}>
                    {menuItem.content}
                  </Box>
                )
              case 'label':
                return <MenuLabel label={menuItem.label} key={id} />
              case 'sub':
                return (
                  <MenuSubMenu
                    content={menuItem.content}
                    items={menuItem.items}
                    key={id}
                  />
                )
              case 'separator':
                return <MenuSeparator key={id} />
              case 'language':
                return (
                  <StyledItem key={id} css={{ paddingRight: '1rem' }}>
                    <LanguageToggle variant="compact" />
                  </StyledItem>
                )
              case 'checkbox':
                return (
                  <MenuCheckBoxItem
                    content={menuItem.content}
                    rightContent={menuItem.rightContent}
                    checked={menuItem.checked}
                    onCheckedChange={menuItem.onCheckedChange}
                    key={id}
                  />
                )
              case 'radio':
                return (
                  <MenuRadioGroup
                    value={menuItem.value}
                    onSelectChange={menuItem.onSelectChange}
                    items={menuItem.items}
                    key={id}
                  />
                )
              case 'beamer':
                return (
                  <StyledItem key={id} css={{ paddingRight: '1rem' }}>
                    <div
                      className="beamerButton"
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                      }}
                    >
                      <SvgIcon
                        css={{
                          marginRight: '1rem',
                        }}
                      >
                        <IoMdNotifications />
                      </SvgIcon>
                      <Text>{t('component:menubar.updates')}</Text>
                    </div>
                  </StyledItem>
                )
              default:
                return null
            }
          })}
          <StyledArrow />
        </StyledContent>
      </Portal>
    </Root>
  )
}

export default DropdownMenu

const StyledTrigger = styled(Trigger, {
  // width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

const UnsetTrigger = styled(Trigger, {
  backgroundColor: 'unset',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const contentStyles = {
  minWidth: '10rem',
  backgroundColor: '$background',
  borderRadius: '$1',

  border: '1px solid $colors$borderColor',
  boxShadow: `0px 10px 20px -20px $colors$shadowColor, 0px 10px 20px -20px $colors$shadowColor`,
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  zIndex: 1,
  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },
}

const StyledContent = styled(Content, contentStyles)
const StyledSubContent = styled(SubContent, contentStyles)

const StyledArrow = styled(Arrow, { fill: '$textSubtle' })

export const itemStyles = {
  all: 'unset',
  fontSize: '$3',
  color: '$text',
  // borderRadius: '$1',
  display: 'flex',
  alignItems: 'center',
  height: '3rem',
  cursor: 'pointer',
  position: 'relative',
  justifyContent: 'flex-start',
  paddingLeft: '1.2rem',
  userSelect: 'none',
  zIndex: '$tooltip',
  gap: '$3',

  '&[data-disabled]': {
    color: '$textDisabled',
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    backgroundColor: '$backgroundLayer3',
  },
}

const StyledItem = styled(Item, itemStyles)
const StyledCheckboxItem = styled(CheckboxItem, itemStyles)
const StyledRadioItem = styled(RadioItem, itemStyles)
const StyledSubTrigger = styled(SubTrigger, {
  '&[data-state="open"]': {
    backgroundColor: '$primary',
    color: '$textContrast',
  },
  ...itemStyles,
})

const StyledLabel = styled(Label, {
  paddingLeft: '1.5rem',
  fontSize: '0.5rem',
  lineHeight: '1.5rem',
  color: '$text',
})

const StyledSeparator = styled(Separator, {
  height: 1,
  backgroundColor: '$textSubtle',
})

const StyledItemIndicator = styled(ItemIndicator, {
  position: 'absolute',
  left: 0,
  width: '1.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: '$8',
  color: '$textSubtle',
  '[data-highlighted] > &': { color: '$textContrast' },
  '[data-disabled] &': { color: '$textDisabled' },
})
