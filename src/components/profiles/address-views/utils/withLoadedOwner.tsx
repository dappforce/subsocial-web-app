import React, { useEffect, useState } from 'react'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../../../utils/SubsocialApiContext';
import { ProfileData } from '@subsocial/types';
import { CommonProps } from './types'
import { Loading } from '../../../utils/utils';

const log = newLogger(withLoadedOwner.name)

type Props = CommonProps & {
  size?: number,
  avatar?: string,
  mini?: boolean
};

export function withLoadedOwner<P extends Props> (Component: React.ComponentType<any>) {
  return function (props: P) {
    const { owner: initialOwner, address } = props as Props;

    if (initialOwner) return <Component {...props} />;

    log.debug('Profile is not loaded yet for this address:', address)

    const { subsocial } = useSubsocialApi()
    const [ owner, setOwner ] = useState<ProfileData>();
    const [ loaded, setLoaded ] = useState(true);

    useEffect(() => {
      if (!address) return;
      setLoaded(false)
      let isSubscribe = true;
      const loadContent = async () => {
        const owner = await subsocial.findProfile(address)
        isSubscribe && setOwner(owner)
        setLoaded(true)
      }

      loadContent().catch(err =>
        log.error('Failed to load profile data:', err));

      return () => { isSubscribe = false; };
    }, [ address?.toString() ]);

    return loaded ? <Component {...props} owner={owner} /> : <Loading />;
  };
}
