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
import { useTranslation } from 'react-i18next'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdNotifications } from 'react-icons/io'

import { cn } from '@/utils/cn'

import Box from '../Containers/Box'
import SvgIcon from '../Images/SvgIcon'
import Text from '../Texts/Text'
import LanguageToggle from '../Toggle/LanguageToggle'
import Tooltip from '../Tooltips/Tooltip'

const contentClassName = cn(
  'min-w-40 bg-background rounded-lg border border-border shadow-lg z-[1070]',
  'data-[state=open]:data-[side=top]:animate-slide-down-fade',
  'data-[state=open]:data-[side=right]:animate-slide-left-fade',
  'data-[state=open]:data-[side=bottom]:animate-slide-up-fade',
  'data-[state=open]:data-[side=left]:animate-slide-right-fade'
)

const itemClassName =
  'group outline-none text-sm text-text flex items-center h-12 relative justify-start pl-5 select-none cursor-pointer gap-3 data-[disabled]:text-text-disabled data-[disabled]:pointer-events-none data-[highlighted]:bg-background-layer-3'

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
  contentProps?: { className?: string }
  triggerProps?: { className?: string }
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
        <Item
          id={id ?? ''}
          disabled={disabled}
          data-testid={dataTestId}
          onSelect={e => {
            e.stopPropagation()
            onClick?.()
          }}
          className={cn(itemClassName, 'gap-0')}
        >
          {content}
          {rightContent && (
            <div className="ml-auto pl-8 text-text-subtle group-data-[highlighted]:text-text-contrast group-data-[disabled]:text-text-disabled">
              {rightContent}
            </div>
          )}
        </Item>
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

const MenuLabel = ({ label }: LabelMenuItemProps): JSX.Element => (
  <Label className="pl-6 text-xs leading-6 text-text">{label}</Label>
)

const MenuSeparator = (): JSX.Element => (
  <Separator className="h-px bg-text-subtle my-1.5" />
)

const MenuSubMenu = ({ content, items }: SubMenuItemProps): JSX.Element => (
  <Sub>
    <SubTrigger
      className={cn(
        itemClassName,
        'data-[state=open]:bg-primary data-[state=open]:text-text-contrast'
      )}
    >
      {content}
      <div className="ml-auto pl-8 text-text-subtle group-data-[highlighted]:text-text-contrast">
        <ChevronRightIcon />
      </div>
    </SubTrigger>
    <Portal>
      <SubContent sideOffset={2} alignOffset={-5} className={contentClassName}>
        {items.map((item, index) => (
          <MenuItem key={index.toString()} {...item} />
        ))}
      </SubContent>
    </Portal>
  </Sub>
)

const MenuCheckBoxItem = ({
  content,
  rightContent,
  checked,
  onCheckedChange,
}: CheckboxMenuItemProps): JSX.Element => (
  <CheckboxItem
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={itemClassName}
  >
    <ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
      <CheckIcon />
    </ItemIndicator>
    {content}
    {rightContent && (
      <div className="ml-auto pl-8 text-text-subtle group-data-[highlighted]:text-text-contrast">
        {rightContent}
      </div>
    )}
  </CheckboxItem>
)

const MenuRadioGroup = ({
  value,
  onSelectChange,
  items,
}: RadioMenuItemProps): JSX.Element => (
  <RadioGroup value={value} onValueChange={onSelectChange}>
    {items.map((item, index) => (
      <RadioItem
        value={item.value}
        key={item.value ?? index.toString()}
        className={itemClassName}
      >
        <ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
          <DotFilledIcon />
        </ItemIndicator>
        {item.content}
        {item.rightContent && (
          <div className="ml-auto pl-8 text-text-subtle group-data-[highlighted]:text-text-contrast">
            {item.rightContent}
          </div>
        )}
      </RadioItem>
    ))}
  </RadioGroup>
)

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
    if (triggerType === 'hover') setOpen(true)
  }

  const handleOnMouseLeave = () => {
    if (triggerType === 'hover') setOpen(false)
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
        <Trigger
          asChild
          onMouseOver={handleOnMouseOver}
          aria-label="Open Menu"
          title="Open Menu"
          className="flex items-center justify-center cursor-pointer"
        >
          <div
            id="dropdownMenu"
            data-testid={dataTestId ?? 'toggle-dropdown'}
            className={cn(className, triggerProps?.className)}
          >
            <GiHamburgerMenu className="h-5 w-5" />
          </div>
        </Trigger>
      )}

      <Portal>
        <Content
          className={cn(
            contentClassName,
            '!border-gray-50 !shadow-xl divide-y divide-gray-300',
            contentProps?.className
          )}
          sideOffset={sideOffset || 5}
          onMouseEnter={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
          style={{
            animationDuration: '400ms',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity',
          }}
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
                  <Item key={id} className={cn(itemClassName, 'pr-4')}>
                    <LanguageToggle variant="compact" />
                  </Item>
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
                  <Item key={id} className={cn(itemClassName, 'pr-4')}>
                    <div className="beamerButton w-full flex flex-row">
                      <SvgIcon className="mr-4">
                        <IoMdNotifications />
                      </SvgIcon>
                      <Text>{t('component:menubar.updates')}</Text>
                    </div>
                  </Item>
                )
              default:
                return null
            }
          })}
          <Arrow className="fill-text-subtle" />
        </Content>
      </Portal>
    </Root>
  )
}

export default DropdownMenu
