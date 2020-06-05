import React, { useState } from 'react';

import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { isMobile } from 'react-device-detect';
import { Avatar } from 'antd';
import { ChooseAccountFromExtension } from './PolkadotExtension';

type LogInButtonProps = {
  size?: string,
  ghost?: boolean,
  title?: string
};

export function LogInButton ({ ghost, title = 'Log In' }: LogInButtonProps) {
  const [ open, setOpen ] = useState(false);

  return <>
    <Button size={isMobile ? 'small' : 'default'} type='primary' ghost={ghost} onClick={() => setOpen(true)}>{title}</Button>
    {open && <LogInModal open={open} hide={() => setOpen(false)} />}
  </>;
}

type ModalProps = {
  open: boolean
  hide: () => void
};

const LogInModal = (props: ModalProps) => {
  const { open = false, hide } = props;
  const [ currentContent, changeContent ] = useState(0)

  const SignInVariant = () => (
    <div>
      <Button type='default' onClick={() => changeContent(1)}>
        <Avatar size={20} src='https://addons.cdn.mozilla.net/user-media/addon_icons/2585/2585880-64.png?modified=3f638f7c' />
        <span className='ml-2'>Sign in with polkadot extension</span>
      </Button>
      <Button type='default' href='/bc/#/accounts' target='_blank' >
        <Avatar size={20} src='http://dapp.subsocial.network/bc/static/substrate-hexagon.d3f5a498.svg' />
        <span className='ml-2'>Create account on apps</span>
      </Button>
    </div>
  )

  const content = [
    <SignInVariant />,
    <ChooseAccountFromExtension />
  ]

  return <Modal
    visible={open}
    title='Log In'
    onOk={hide}
    onCancel={hide}
    footer={[
      currentContent > 0 &&
        <Button key='back' onClick={() => changeContent(0)}>
          Back
        </Button>,
      <Button key='close' onClick={hide}>
        Close
      </Button> ]
    }
  >
    {content[currentContent]}
  </Modal>;
};

export default LogInButton;
