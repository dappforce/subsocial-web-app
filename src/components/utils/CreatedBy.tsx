import React from 'react';
import { Table } from 'semantic-ui-react';

import AddressMiniDf from './AddressMiniDf';
import { formatNumber } from '@polkadot/util';

import { Change } from '../types';

type CreatedByProps = {
  created: Change,
  dateLabel?: string,
  accountLabel?: string
};

export const CreatedBy = (props: CreatedByProps) => (
  <Table celled selectable compact definition className='ProfileDetailsTable'>
    <Table.Body>
      <Table.Row>
        <Table.Cell>{props.dateLabel ? props.dateLabel : 'Created on'}</Table.Cell>
        <Table.Cell>{new Date(props.created.time.toNumber()).toLocaleString()} at block #{formatNumber(props.created.block)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>{props.accountLabel ? props.accountLabel : 'Created by'}</Table.Cell>
        <Table.Cell><AddressMiniDf value={props.created.account} isShort={false} isPadded={false} size={36} withName withBalance /></Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
