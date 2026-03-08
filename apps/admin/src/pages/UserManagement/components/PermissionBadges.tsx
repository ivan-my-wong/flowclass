import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import { SinglePermission } from '@/types/user'
import { cn } from '@/utils/cn'

type PermissionBadgesProps = {
  permissions: SinglePermission[]
  type?: 'vertical' | 'horizontal'
}

const PermissionBadges = ({
  permissions,
  type = 'vertical',
}: PermissionBadgesProps): JSX.Element => {
  const { t } = useTranslation()

  const permissionText = useMemo(() => {
    if (!permissions) return []

    return permissions
      .map(permission => {
        return Object.keys(permission)
          .filter(
            key =>
              permission[key as keyof SinglePermission] &&
              typeof permission[key as keyof SinglePermission] === 'boolean' &&
              key !== 'isStudent'
          )
          .map(key => {
            return t(`setting:userManagement.${key}`)
          })
      })
      .flat()
  }, [permissions, t])

  return (
    <div
      className={cn(
        type === 'horizontal'
          ? 'box-row-full justify-start overflow-x-auto'
          : 'box-col-full'
      )}
    >
      {permissionText
        .flatMap(text => text)
        .map(text => (
          <Badge key={text} variant="success">
            {text}
          </Badge>
        ))}
    </div>
  )
}

export default PermissionBadges
