import dynamic from 'next/dynamic';
const OnBoardingPage = dynamic(() => import('../components/docs/onboarding/OnBoardingPage'), { ssr: false });

export default OnBoardingPage
