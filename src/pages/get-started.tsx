import dynamic from 'next/dynamic';
const OnBoardingPage = dynamic(() => import('../components/onboarding/OnBoardingPage'), { ssr: false });

export default OnBoardingPage
