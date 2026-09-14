import { styled } from '../../styles'

export const Table = styled('table', {
  borderCollapse: 'collapse',
  width: '100%',
})
export const Thead = styled('thead', {})
export const TrHead = styled('tr', {
  border: '1px solid #ddd',
  backgroundColor: '$backgroundLayer3',
  padding: '$2',
  height: 50,
})
export const TrBody = styled('tr', {
  border: '1px solid #ddd',
  height: 50,
})
export const TdPrepareTable = styled('td', {
  border: '1px solid #ddd',
  padding: '8px',
  minWidth: '70px',
  lineHeight: '22px',
})

export const Td = styled(TdPrepareTable, {
  minWidth: '170px',
  textAlign: 'center',
})
