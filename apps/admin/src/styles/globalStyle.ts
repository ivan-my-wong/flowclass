import { globalCss } from '.'

export const globalStyles = globalCss({
  '@import': [
    "url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap')",
    "url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap')",
  ],

  // '@font-face': {
  //   fontFamily: 'Lato',
  //   src: "local('Lato'), url(../assets/fonts/Lato-VariableFont_wght.ttf) format('ttf')",
  //   fontWeight: '100 900' /* Define the range of weights supported */,
  //   fontStyle: 'normal',
  // },

  'html, body': {
    position: 'relative',
    zIndex: 0,
    padding: 0,
    margin: 0,
    fontSize: '16px',
    lineHeight: 1,
    height: '100%',
    minHeight: '100vh',
  },
  body: {
    backgroundColor: '$background',
    color: '$text',
    // overflow: 'hidden',
  },
  div: {
    position: 'relative',
  },
  'h1, h2, h3, h4, h5, h6': {
    fontFamily: 'Lato, Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  'p, span, label': {
    fontFamily: 'Lato, Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  '#root': {
    minHeight: '100%',
    height: '100%',
    // minWidth: '1200px',
    padding: 0,
    margin: 0,
    // overflow: 'auto',
  },
  '*': {
    boxSizing: 'border-box',
  },
})
