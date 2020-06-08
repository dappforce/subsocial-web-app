import OnBoardingPage from '../components/onboarding/OnBoardingPage'
import { StepsEnum } from 'src/components/onboarding'

export default () => <OnBoardingPage title='Create your space' onlyStep={StepsEnum.CreateSpace} />
