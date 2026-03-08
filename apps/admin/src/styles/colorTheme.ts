import {
  blackAlpha,
  blue,
  gray,
  green,
  orange,
  pink,
  purple,
  red,
  teal,
  whiteAlpha,
  yellow,
} from './colors'

type ThemeColors = {
  primary: string
  primarySubtle: string
  primaryHighlight: string
  primaryHighlightSubtle: string

  secondary: string
  secondarySubtle: string
  tertiary: string

  background: string
  backgroundLayer2: string
  backgroundLayer3: string
  backgroundLayer4: string
  backgroundDisabled: string

  text: string
  textContrast: string
  textSubtle: string
  textHighlight: string
  textDisabled: string

  success: string
  successSubtle: string
  warn: string
  warnSubtle: string

  borderColor: string
  borderColorPrimary: string

  shadowColor: string
  shadowColorHighlight: string
  // modal overlay
  overlayColor: string

  // For interactive element
  facebookBlue: string
  textSub: string
  publishSuccess: string
}
export const lightThemeColors: ThemeColors = {
  primary: blue[600],
  primarySubtle: blue[400],
  primaryHighlight: blue[800],
  primaryHighlightSubtle: blue[100],

  secondary: yellow[700],
  secondarySubtle: yellow[500],

  tertiary: pink[400],

  background: 'white',
  backgroundLayer2: gray[50],
  backgroundLayer3: gray[100],
  backgroundLayer4: gray[200],
  backgroundDisabled: gray[400],

  text: blackAlpha[900],
  textContrast: 'white',
  textSubtle: gray[600],
  textHighlight: purple[500],
  textDisabled: gray[200],

  borderColor: blackAlpha[600],
  borderColorPrimary: blue[700],

  shadowColor: blackAlpha[100],
  shadowColorHighlight: blackAlpha[50],

  success: green[500],
  successSubtle: green[100],
  warn: red[500],
  warnSubtle: red[100],

  overlayColor: blackAlpha[500],

  // constants
  facebookBlue: '#1877f2',
  textSub: gray[500],
  publishSuccess: green[200],
}

export const darkThemeColors: ThemeColors = {
  primary: orange[500],
  primarySubtle: orange[600],
  primaryHighlight: orange[400],
  primaryHighlightSubtle: orange[100],
  secondary: teal[500],
  secondarySubtle: teal[600],
  tertiary: purple[500],

  background: gray[900],
  backgroundLayer2: gray[800],
  backgroundLayer3: gray[700],
  backgroundLayer4: gray[900],
  backgroundDisabled: gray[600],

  text: 'white',
  textContrast: gray[900],
  textSubtle: yellow[300],
  textHighlight: teal[500],
  textDisabled: gray[300],

  success: green[400],
  successSubtle: green[100],
  warn: red[400],
  warnSubtle: red[100],

  borderColor: gray[300],
  borderColorPrimary: orange[300],
  shadowColor: whiteAlpha[800],
  shadowColorHighlight: whiteAlpha[700],

  overlayColor: blackAlpha[500],

  // constants
  facebookBlue: '#1877f2',
  textSub: gray[300],
  publishSuccess: green[400],
}
