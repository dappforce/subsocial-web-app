import React, { useEffect, useState } from 'react'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../../../utils/SubsocialApiContext';
import { ProfileData } from '@subsocial/types';
import { CommonAddressProps } from './types'

type Props = CommonAddressProps & {
  myAddress?: string
};

export function withLoadedOwner (Component: React.ComponentType<any>) {
  const log = newLogger('Account HOC')
  return function (props: any) {
    const { address, owner: initialOwner, myAddress = address } = props as Props;

    if (initialOwner) return <Component {...props} />;

    console.log('Author is not exist')
    const { subsocial } = useSubsocialApi()
    const [ owner, setOwner ] = useState<ProfileData | undefined>(initialOwner);

    useEffect(() => {

      let isSubscribe = true;
      const loadContent = async () => {
        const owner = await subsocial.findProfile(myAddress)
        isSubscribe && setOwner(owner)
      }

      loadContent().catch(err => log.error('Failed to load profile data:', err));

      return () => { isSubscribe = false; };
    }, [ address ]);

    return <Component {...props} owner={owner} />;
  };
}
