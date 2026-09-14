import { keyframes, styled } from '../../styles'

const spin = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
})

const Spinner = styled('div', {
  borderRadius: '50%',
  $$spinnerSize: '4em',
  $$spinnerWidth: '5px',
  $$spinnerShadow: 'rgba(217,217,217, 0.2)',
  $$spinnerFilled: '#d9d9d9',
  width: '$$spinnerSize',
  height: '$$spinnerSize',
  margin: 'calc($$spinnerSize / 2) auto',
  fontSize: '10px',
  position: 'relative',
  borderTop: '$$spinnerWidth solid $$spinnerShadow',
  borderRight: '$$spinnerWidth solid $$spinnerShadow',
  borderBottom: '$$spinnerWidth solid $$spinnerShadow',
  borderLeft: '$$spinnerWidth solid $$spinnerFilled',
  animation: `${spin} 1.1s infinite linear`,

  variants: {
    size: {
      small: {
        $$spinnerSize: '2em',
        fontSize: '$2',
        margin: '-$1 0',
      },
    },
  },
})

const rotate = keyframes({
  '100%': { transform: 'rotate(360deg)' },
})

const dash = keyframes({
  '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
  '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
  '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' },
})

const Spinner2 = styled('svg', {
  animation: `${rotate} 2s linear infinite`,
  zIndex: '2',
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-$4 0 0 -$4',
  width: '$6',
  height: '$6',

  '& .path': {
    stroke: 'hsl(210, 70%, 75%)',
    strokeLinecap: 'round',
    animation: `${dash} 1.5s ease-in-out infinite`,
  },
})

export { Spinner, Spinner2 }
