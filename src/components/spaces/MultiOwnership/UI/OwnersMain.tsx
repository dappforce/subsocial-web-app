import React, { useContext, useCallback } from 'react';

// Components
import {
  Form,
  Row,
  Col,
  Button,
  Typography,
  Table,
  Input
} from 'antd';

import { DividerMargin } from './DividerMargin';

// Context
import { Context } from '../context/context';
import {
  selectOwnersFromMain
} from '../context/actions';

// Types
import {
  MainContext,
  SubstrateAddress,
  OwnersListColumnsType
} from '../types';

// Utils
import { shorten } from '../utils/shorten'

// SubComponents
const { Text }: any = Typography;
const { Search }: any = Input;

export const OwnersMain = () => {
  const {
    state: {
      owners,
      selectedOwnersFromMain
    },
    dispatch
  } = useContext<MainContext>(Context);

  const mainListRowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any): void =>
      dispatch(selectOwnersFromMain(selectedRows))

  };

  const mainListColumns: Array<OwnersListColumnsType> = [
    {
      title: 'Account',
      dataIndex: 'account',
      render: useCallback((account: SubstrateAddress) => (
        <Row type="flex" align="middle">
          <Col>
            <img src={`${account.img}`} alt="polka" />
          </Col>

          <Col xs={13} className="_ml5">
            <a
              target="_blank"
              href={`https://polkascan.io/pre/kusama/account/${account.address}`}
            >
              {/* {shorten(account.address).short} */}
              {account.address}
            </a>
          </Col>
        </Row>
      ), [ owners ])
    }
  ];

  return (
    <>
      <Table
        size="small"
        pagination={false}
        rowSelection={mainListRowSelection}
        columns={mainListColumns}
        dataSource={owners}
        bordered
      />
      {
        selectedOwnersFromMain.length
          ? <Button type="danger" ghost className="_mt15 _mb15">
              Remove
          </Button>
          : null
      }
    </>
  )
};
