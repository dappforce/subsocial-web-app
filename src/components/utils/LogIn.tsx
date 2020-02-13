import React, { useState } from 'react';

import { Button, Modal } from 'antd';
import InputAddress from './InputAddress';
import { isMobile } from 'react-device-detect';

type LogInButtonProps = {
  size?: string
};

export function LogInButton (props: LogInButtonProps) {
  const [ open, setOpen ] = useState(false);

  return <>
    <Button size={isMobile ? 'small' : 'default'} type='primary' ghost onClick={() => setOpen(!open)}>Log In</Button>
    {open && <LogInModal open={open}/>}
  </>;
}

type ModalProps = {
  open: boolean
};

const LogInModal = (props: ModalProps) => {
  const { open = false } = props;
  const [ visible, setVisible ] = useState(open);

  return <Modal
    visible={visible}
    title='Log In'
    onOk={() => setVisible(false)}
    onCancel={() => setVisible(false)}
    footer={[
      <Button key='back' onClick={() => setVisible(false)}>
        Close
      </Button>]
    }
  >
    <InputAddress
      className='DfTopBar--InputAddress' // FIXME dropdown in  popup
      type='account'
      withLabel={false}
    />
  </Modal>;
};

export default LogInButton;
