import { forwardRef } from 'react'
import { NavLink as RouterLink } from 'react-router-dom'

import {
  Content,
  Item,
  List,
  Root,
  Trigger,
} from '@radix-ui/react-navigation-menu'
import { MdArrowDropDown } from 'react-icons/md'

import { cn } from '@/utils/cn'

import {
  GroupRouteItem,
  isGroupRouteItem,
  isSingleRouteItem,
  SingleRouteItem,
} from '../../types/route'

const itemBaseClasses =
  'outline-none select-none font-bold text-base text-text hover:opacity-70'

const NavMenuItemTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Trigger>
>(({ children, ...props }, ref) => {
  return (
    <Trigger
      {...props}
      ref={ref}
      className={cn(
        itemBaseClasses,
        'group p-2 flex items-center justify-between gap-2'
      )}
    >
      {children}
      <MdArrowDropDown
        aria-hidden
        className="relative transition-transform duration-150 group-data-[state=open]:rotate-180"
      />
    </Trigger>
  )
})

const NavMenuItemContent = ({
  className,
  ...props
}: React.ComponentProps<typeof Content>) => (
  <Content
    className={cn(
      'absolute origin-top rounded-lg min-w-[110px] bg-background shadow-lg',
      className
    )}
    {...props}
  />
)

const NavMenuItemLink = ({
  className,
  ...props
}: React.ComponentProps<typeof RouterLink>) => (
  <RouterLink
    className={({ isActive }) =>
      cn(
        itemBaseClasses,
        'p-2 flex gap-2 no-underline text-base hover:bg-background-layer-2',
        isActive && 'border-b-2 border-primary',
        typeof className === 'function' ? className({ isActive }) : className
      )
    }
    {...props}
  />
)

const SingleNavItem: React.FC<SingleRouteItem> = ({ label, url, icon }) => {
  return (
    <Item>
      <NavMenuItemLink to={url}>
        {label}
        {icon}
      </NavMenuItemLink>
    </Item>
  )
}

const GroupNavItem: React.FC<GroupRouteItem> = ({ label, items }) => {
  return (
    <Item>
      <NavMenuItemTrigger>{label}</NavMenuItemTrigger>
      <NavMenuItemContent>
        {items.map(item => {
          return (
            <NavMenuItemLink key={item.url} to={item.url}>
              {item.label}
            </NavMenuItemLink>
          )
        })}
      </NavMenuItemContent>
    </Item>
  )
}
const NavMenu = ({
  routes,
}: {
  routes: Array<SingleRouteItem | GroupRouteItem>
}): JSX.Element => {
  return (
    <Root className="relative flex justify-center w-full z-[1]">
      <List className="flex justify-center gap-4 p-1 rounded-lg list-none">
        {routes.map((el, idx) => {
          if (isSingleRouteItem(el)) {
            // eslint-disable-next-line react/no-array-index-key
            return <SingleNavItem key={`${el.label}_${idx}`} {...el} />
          }
          if (isGroupRouteItem(el)) {
            // eslint-disable-next-line react/no-array-index-key
            return <GroupNavItem key={`${el.label}_${idx}`} {...el} />
          }
          return null
        })}
      </List>
    </Root>
  )
}

export default NavMenu
