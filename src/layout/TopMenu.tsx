import React from 'react';
import { Menu, Image } from 'semantic-ui-react';
import InputAddress from '../components/utils/InputAddress';
import Search from '../components/search/Search';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';

const InnerMenu = () => {

  return (
      <Menu className='DfMenu' inverted fixed='top'>
        <Menu.Item as='a' header style={{ marginRight: '1.5em' }}>
          <Image size='mini' src={substrateLogo} style={{ marginRight: '1.5em', marginTop: '-.5rem', marginBottom: '-.5rem' }} />
          <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
        </Menu.Item>

        <Search />
        <InputAddress
          className='DfTopBar--InputAddress'
          label={'My account:'}
          type='account'
        />
      </Menu>
  );
};

export default InnerMenu;
