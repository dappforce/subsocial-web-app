import OnBoardingPage from '../components/docs/onboarding/OnBoardingPage'
import { StepsEnum } from 'src/components/docs/onboarding'

export default () => <OnBoardingPage title='Create your space' onlyStep={StepsEnum.CreateSpace} />
