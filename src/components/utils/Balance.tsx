import React, { useState } from 'react'
import { AnyAccountId } from '@subsocial/types';
import useSubsocialEffect from '../api/useSubsocialEffect'

const useGetBalance = (address: AnyAccountId) => {
  const [ balance, setBalance ] = useState<string>()

  useSubsocialEffect(({ substrate }) => {
    let unsub: (() => void ) | undefined;

    const sub = async () => {
      const api = await substrate.api;

      unsub = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance
        gtZero()
      });
    }
  })
}