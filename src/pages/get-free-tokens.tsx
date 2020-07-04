import OnBoardingPage from '../components/onboarding/OnBoardingPage'
import { StepsEnum } from 'src/components/auth/AuthContext'

export default () => <OnBoardingPage title='Get free tokens' onlyStep={StepsEnum.GetTokens} />
