import { StepType } from '@reactour/tour'
import { t } from 'i18next'

import flowclassLogo from '@/assets/logos/flowclass.png'
import schoolNameImage from '@/assets/tour/school/schoolName.gif'
import domainNameImage from '@/assets/tour/setUp/domainNameTour.gif'
import Box from '@/components/Containers/Box'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'

const setUpTourSteps: StepType[] = [
  {
    selector: '#setUpWebsiteHeading',
    content: (
      <Box direction="column">
        <img width="100%" alt="bannerImageTips" src={flowclassLogo} />
        <Separator />
        <Text>{t('onboarding:tourStep.welcome')}</Text>
        <Text>{t('onboarding:tourStep.welcome2')}</Text>
      </Box>
    ),
  },
  // {
  //   selector: '#setUpWebsiteHeading',
  //   content: (
  //     <Box direction="column">
  //       <img width="100%" alt="bannerImageTips" src={flowclassLogo} />
  //       <Separator />
  //       <Text>{t('onboarding:tourStep.greeting')}</Text>
  //     </Box>
  //   ),
  // },
  {
    selector: '#siteNameBox',
    content: (
      <Box direction="column">
        <img width="100%" alt="bannerImageTips" src={domainNameImage} />
        <Separator />
        <Text>{t('onboarding:tourStep.domain')}</Text>
        <Text>{t('onboarding:tourStep.changeDomain')}</Text>
      </Box>
    ),
  },
  {
    selector: '#schoolNameText',
    highlightedSelectors: ['#schoolName'],
    content: (
      <Box direction="column">
        <img width="100%" alt="bannerImageTips" src={schoolNameImage} />
        <Separator />
        <Text>{t('onboarding:tourStep.schoolName')}</Text>
      </Box>
    ),
  },
]

export default setUpTourSteps
