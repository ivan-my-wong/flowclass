import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const TeacherWidget = ({
  title,
  icon,
  value,
  symbol,
  isLoading,
}: {
  title: string
  icon: React.ReactNode
  value: number | string
  symbol?: string
  isLoading?: boolean
}): JSX.Element => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonLoader height="20px" width="100%" />
        ) : (
          <h1 className="text-2xl font-bold">
            {symbol}
            {value}
          </h1>
        )}
      </CardContent>
    </Card>
  )
}

export default TeacherWidget
