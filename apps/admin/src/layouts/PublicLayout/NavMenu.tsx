import { forwardRef } from 'react'
import { NavLink as RouterLink } from 'react-router-dom'

import {
  Content,
  Item,
  List,
  Root,
  Trigger,
} from '@radix-ui/react-navigation-menu'
import { ComponentProps, CSS } from '@stitches/react'
import { MdArrowDropDown } from 'react-icons/md'

import { styled, ThemeConfig } from '../../styles'
import {
  GroupRouteItem,
  isGroupRouteItem,
  isSingleRouteItem,
  SingleRouteItem,
} from '../../types/route'

const itemStyles: CSS<ThemeConfig> = {
  outline: 'none',
  userSelect: 'none',
  fontWeight: 'bold',
  fontSize: '$medium',
  color: '$text',
  '&:hover': {
    opacity: '0.7',
  },

  variants: {
    noHover: {
      true: {
        '&:hover': {
          opacity: 'unset',
        },
      },
    },
  },
}

const StyledCaret = styled(MdArrowDropDown, {
  position: 'relative',
  '[data-state=open] &': { transform: 'rotate(-180deg)' },
  '@media (prefers-reduced-motion: no-preference)': {
    transition: 'transform 150ms ease',
  },
})

const StyledTrigger = styled(Trigger, {
  all: 'unset',
  ...itemStyles,
  padding: '$small $small',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
})

const NavMenuItemTrigger = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof StyledTrigger>
>(({ children, ...props }, ref) => {
  return (
    <StyledTrigger {...props} ref={ref}>
      {children}
      <StyledCaret aria-hidden />
    </StyledTrigger>
  )
})

const NavMenuItemContent = styled(Content, {
  position: 'absolute',
  transformOrigin: 'top center',
  borderRadius: '$medium',
  minWidth: '110px',
  backgroundColor: '$background',
  boxShadow: '0 0 10px $colors$shadowColor',
})

const NavMenuItemLink = styled(RouterLink, {
  ...itemStyles,
  padding: '$small $small',
  display: 'flex',
  gap: '0.5rem',
  textDecoration: 'none',
  fontSize: '$medium',

  '&:hover': {
    backgroundColor: '$backgroundLayer2',
  },

  '&.active': {
    borderBottom: '2px solid $colors$primary',
  },
})

const NavMenuRoot = styled(Root, {
  position: 'relative',
  flexRowCenter: 'center',
  width: '100%',
  zIndex: 1,
})

const NavMenuList = styled(List, {
  all: 'unset',
  flexRowCenter: 'center',
  gap: '$medium',
  padding: '$min',
  borderRadius: '$medium',
  listStyle: 'none',
})

const SingleNavItem: React.FC<SingleRouteItem> = ({ label, url, icon }) => {
  return (
    <Item>
      <NavMenuItemLink
        to={url}
        className={({ isActive }) => (isActive ? 'active' : 'inactive')}
      >
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
    <NavMenuRoot>
      <NavMenuList>
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
      </NavMenuList>
    </NavMenuRoot>
  )
}

export default NavMenu
