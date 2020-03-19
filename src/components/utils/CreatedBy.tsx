import React from 'react';
import { Table } from 'semantic-ui-react';

import AddressComponents from './AddressComponents';
import { formatNumber } from '@polkadot/util';

import { Change } from '@subsocial/types/substrate/interfaces/subsocial';
import { formatUnixDate } from './utils';

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
        <Table.Cell>{formatUnixDate(props.created.time)} at block #{formatNumber(props.created.block)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>{props.accountLabel ? props.accountLabel : 'Created by'}</Table.Cell>
        <Table.Cell><AddressComponents value={props.created.account} isShort={false} isPadded={false} size={36} withName withBalance /></Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
