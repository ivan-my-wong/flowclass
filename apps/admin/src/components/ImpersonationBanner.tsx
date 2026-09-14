import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { LocalStorageKeys } from '@/constants/localStorageKeys'
import { userState } from '@/stores/userData'
import { styled } from '@/styles'

const BannerContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  backgroundColor: '#e11d48', // premium warning crimson
  color: '#ffffff',
  fontSize: '0.875rem',
  fontWeight: '600',
  width: '100%',
  boxSizing: 'border-box',
  zIndex: 9999,
  height: '2.5rem',
})

const InfoText = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

const StopButton = styled('button', {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '4px',
  padding: '0.25rem 0.75rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
})

const ImpersonationBanner = () => {
  const user = useRecoilValue(userState)
  const isImpersonating = !!localStorage.getItem('impersonator-access-token')

  if (!isImpersonating) return null

  const handleStopImpersonating = () => {
    const adminAccess = localStorage.getItem('impersonator-access-token')
    const adminRefresh = localStorage.getItem('impersonator-refresh-token')

    if (adminAccess && adminRefresh) {
      localStorage.setItem(LocalStorageKeys.UserAccessToken, adminAccess)
      localStorage.setItem(LocalStorageKeys.UserRefreshToken, adminRefresh)
    }

    localStorage.removeItem('impersonator-access-token')
    localStorage.removeItem('impersonator-refresh-token')

    toast.success('Restored original administrator session')
    window.location.href = '/admin'
  }

  return (
    <BannerContainer>
      <InfoText>
        <span>⚠️</span>
        Currently impersonating:{' '}
        <strong>{user.email || user.phone || 'User'}</strong> (ID: {user.id})
      </InfoText>
      <StopButton onClick={handleStopImpersonating}>
        Stop Impersonating
      </StopButton>
    </BannerContainer>
  )
}

export default ImpersonationBanner
