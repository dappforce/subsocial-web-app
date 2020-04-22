import React, { useReducer, useEffect } from 'react';
import { DividerMargin, Info, Confirmations, OwnersList, Changes } from './UI/index';

// Utils
import HeadMeta from '../../utils/HeadMeta';
import Section from '../../utils/Section';

// Styles
import './index.css';

// Context
import { reducer, initialState } from './context/reducer';
import { Context } from './context/context';
import { setState } from './context/actions';

export const MultiOwnership = ({ data, test }: any): React.ReactElement => {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  useEffect(() => dispatch(setState(data)), []);

  const pageTitle = 'Manage space access';

  return (
    <Context.Provider value={{ state, dispatch }}>
      <HeadMeta title={pageTitle} />

      <Section title={pageTitle}>
        <DividerMargin />

        <Info />

        <Confirmations />

        <OwnersList />

        <Changes />
      </Section>
    </Context.Provider>
  )
}
