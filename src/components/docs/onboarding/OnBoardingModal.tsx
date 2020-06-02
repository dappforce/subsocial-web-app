import React from 'react'
import { Modal, Button } from 'antd';
import { OnBoarding } from './OnBoarding';
import { useBoarding } from './OnBoardingContex';
import { isMobile } from 'react-device-detect';

export const OnBoardingModal = () => {

  const { setCurrentStep, setOpenModal, state: { currentStep, openModal } } = useBoarding()
  return (
    <Modal
      visible={openModal}
      onCancel={() => setOpenModal(false)}
      width={isMobile ? '100%' : '60%'}
      title={<OnBoarding direction='horizontal' />}
      footer={[
        <Button key="previous" type="primary" disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
          Previous
        </Button>,
        <Button key="next" type="primary" disabled={currentStep === 3} onClick={() => setCurrentStep(currentStep + 1)}>
          Next
        </Button>
      ]}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Modal>
  );
}
