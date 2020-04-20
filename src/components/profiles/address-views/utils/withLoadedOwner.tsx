import React, { useEffect, useState } from 'react'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../../../utils/SubsocialApiContext';
import { ProfileData } from '@subsocial/types';
import { CommonAddressProps } from './types'

type Props = CommonAddressProps & any;

export function withLoadedOwner<P extends Props> (Component: React.ComponentType<P>) {
  const log = newLogger('Account HOC')
  return function (props: P) {
    const { address, owner: initialAddress } = props;

    if (initialAddress) return <Component {...props} />;

    console.log('Author is not exist')
    const { subsocial } = useSubsocialApi()
    const [ owner, setAuthor ] = useState<ProfileData>();

    useEffect(() => {

      let isSubscribe = true;
      const loadContent = async () => {
        const owner = await subsocial.findProfile(address)
        isSubscribe && setAuthor(owner)
      }

      loadContent().catch(err => log.error('Failed to load profile data:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    return <Component {...props} owner={owner} />;
  };
}
