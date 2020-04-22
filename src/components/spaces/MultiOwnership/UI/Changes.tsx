import React, { useContext, useMemo } from 'react';

// Components
import {
  Row,
  Col,
  Button,
  Typography,
  Tabs,
  Table,
  Tag
} from 'antd';

import { DividerMargin } from './DividerMargin';

// Context
import { Context } from '../context/context';

// Types
import { MainContext, ChangeRowType, ChangeTabType } from '../types';

// SubComponents
const { Text }: any = Typography;
const { TabPane }: any = Tabs;

export const Changes: React.FC = (): React.ReactElement => {
  const {
    state: {
      changes
    },
    dispatch
  } = useContext<MainContext>(Context);

  const changesColumns: any = [
    {
      title: 'Signs',
      dataIndex: 'confirmations',
      align: 'center',
      render: (confirmations, { confirmationsRequired }) =>
        `${confirmations}/${confirmationsRequired}`
    },
    {
      title: 'Info',
      dataIndex: 'id',
      render: (id, { time, note }) => (
        <>
          <p><Text strong>Id: </Text>{id}</p>
          <p><Text strong>Time: </Text>{time}</p>
          <p><Text strong>Note: </Text>{note}</p>
        </>
      )
    },
    {
      title: 'Response',
      dataIndex: 'response',
      align: 'center',
      render: (response) => {
        switch (response) {
          case 'approved':
            return <Text style={{ color: '#52c41a' }}>Approved</Text>
          case 'confirmed':
            return <Button
              type="danger"
              size="small"
              ghost
              onClick={() => {}}
            >
              Cancel
            </Button>;
          case 'waiting':
            return <Button
              type="primary"
              size="small"
              onClick={() => {}}
            >
              Confirm
            </Button>;
        }
      }
    }
  ];

  const renderTabPane = (
    name: string,
    filters: Array<string>,
    key: string): React.ReactElement => {
    const filteredChanges: Array<ChangeRowType> = changes.reduce((
      acc: Array<ChangeRowType>,
      action: ChangeRowType
    ) =>
      filters.includes(action.response) || filters.includes('all')
        ? [ action, ...acc ]
        : acc, []);

    return (
      <TabPane tab={`${name}(${filteredChanges.length})`} key={key}>
        <Table
          size="small"
          columns={changesColumns}
          dataSource={filteredChanges}
          pagination={{ defaultPageSize: 5 }}
          bordered
        />
      </TabPane>
    )
  }

  const changesTabs: Array<ChangeTabType> = [
    {
      name: 'All',
      filters: [ 'all' ],
      key: '1'
    },
    {
      name: 'Pending',
      filters: [
        'waiting',
        'confirmed'
      ],
      key: '2'
    },
    {
      name: 'Executed',
      filters: [ 'approved' ],
      key: '3'
    }
  ]

  return (
    <div className="_mt30">
      <Text>{changes.length} changes</Text>

      <DividerMargin />

      <Tabs defaultActiveKey="1">
        {
          useMemo((): Array<React.ReactElement> =>
            changesTabs.map(({ name, filters, key }) =>
              renderTabPane(name, filters, key)), [ changesTabs ])
        }
      </Tabs>
    </div>
  )
};
