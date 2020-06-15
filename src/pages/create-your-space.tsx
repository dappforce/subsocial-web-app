import OnBoardingPage from '../components/onboarding/OnBoardingPage'
import { StepsEnum } from 'src/components/auth/AuthContext'

export default () => <OnBoardingPage title='Create your space' onlyStep={StepsEnum.CreateSpace} />
