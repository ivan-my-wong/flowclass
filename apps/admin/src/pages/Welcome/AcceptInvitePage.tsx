import { useSearchParams } from 'react-router-dom'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import Box from '@/components/ui/Box'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'

import InvalidInvitation from './InvalidInvitation'
import RegisterInvitationForm from './RegisterInvitationForm'
import SessionExist from './SessionExist'

const AcceptInvitePage: React.FC = () => {
  const { siteData } = useSiteData()

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { useGetInvitationByToken } = useUsersManagement()
  const { data: invitationData, isLoading: isInvitationLoading } =
    useGetInvitationByToken(token ?? '')

  return (
    <>
      {isInvitationLoading ? (
        <SkeletonLoader height="100vh" />
      ) : (
        <Box direction="col">
          {/* Invalid Invitation if no invitation data and not loading */}
          {!invitationData && !isInvitationLoading && <InvalidInvitation />}
          {/* Register Invitation if site data and invitation data */}
          {/* Session Exist if site data and invitation data */}
          {siteData &&
          siteData.sites &&
          siteData.sites.length === 0 &&
          invitationData ? (
            <RegisterInvitationForm
              token={token ?? ''}
              invitationData={invitationData}
            />
          ) : (
            <SessionExist />
          )}
        </Box>
      )}
    </>
  )
}

export default AcceptInvitePage
