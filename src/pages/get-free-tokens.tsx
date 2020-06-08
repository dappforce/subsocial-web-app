import OnBoardingPage from '../components/onboarding/OnBoardingPage'
import { StepsEnum } from 'src/components/onboarding'

export default () => <OnBoardingPage title='Get free tokens' onlyStep={StepsEnum.GetTokens} />
