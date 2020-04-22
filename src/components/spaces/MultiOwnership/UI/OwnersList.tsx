import React, { useContext } from 'react';

// Components
import {
  Row,
  Col,
  InputNumber,
  Button,
  Typography,
  Tabs,
  Table,
  Input
} from 'antd';

import { DividerMargin } from './DividerMargin';
import { OwnersMain } from './OwnersMain';
import { OwnersToAdd } from './OwnersToAdd';

// Context
import { Context } from '../context/context';
import {
  setOwnersToAdd,
  removeOwnersFromToAdd,
  selectOwnersFromToAdd,
  selectOwnersFromMain
} from '../context/actions';

// Validation
import { ConfirmationsValidation } from '../validation';

// Types
import { ConfirmationsFormProps, MainContext } from '../types';

// Utils
import { shorten } from '../utils/shorten'

// SubComponents
const { Text }: any = Typography;
const { TabPane }: any = Tabs;

export const OwnersList = () => {
  const {
    state: {
      owners,
      toAddInput,
      ownersToAdd,
      selectedOwnersFromToAdd,
      selectedOwnersFromMain,
      showRemoveButtonForMainList,
      showRemoveButtonForToAddList
    },
    dispatch
  } = useContext(Context);

  return (
    <div className="_mt30">
      <Text>{owners.length} accounts</Text>
      <DividerMargin />

      <Tabs defaultActiveKey="1">
        <TabPane tab="Accounts" key="1">
          <OwnersMain />
        </TabPane>

        <TabPane tab="Add new" key="2">
          <OwnersToAdd />
        </TabPane>
      </Tabs>
    </div>
  )
};
