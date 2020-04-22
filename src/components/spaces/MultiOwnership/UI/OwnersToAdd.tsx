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
  setOwnersToAdd,
  removeOwnersFromToAdd,
  selectOwnersFromToAdd
} from '../context/actions';

// Validation
import { OwnersToAddValidation } from '../validation';

// Types
import { ConfirmationsFormProps, MainContext, SubstrateAddress, OwnersListColumnsType } from '../types';

// Utils
import { shorten } from '../utils/shorten'

// SubComponents
const { Text }: any = Typography;
const { Search }: any = Input;

export const OwnersToAddForm: React.FC<ConfirmationsFormProps> = ({
  form: {
    getFieldDecorator,
    getFieldError,
    isFieldTouched,
    validateFields,
    resetFields
  }
}): React.ReactElement => {
  const {
    state: {
      ownersToAdd,
      selectedOwnersFromToAdd
    },
    dispatch
  } = useContext<MainContext>(Context);

  const toAddListRowSelection: any = {
    onChange: (selectedRowKeys: any, selectedRows: any): void =>
      dispatch(selectOwnersFromToAdd(selectedRows))
  };

  const toAddListColumns: Array<OwnersListColumnsType> = [
    {
      title: 'Account',
      dataIndex: 'account',
      render: useCallback((account: SubstrateAddress): React.ReactElement => (
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
      ), [ ownersToAdd ])
    }
  ];

  const handleSubmit = (event: React.FormEvent<HTMLInputElement>): void => {
    event.preventDefault();

    validateFields((err: any, { ownerToAdd }: { ownerToAdd: string; }) => {
      if (!err) {
        dispatch(setOwnersToAdd(ownerToAdd));
        console.log('Received values of form: ', ownerToAdd);
      }
    });

    resetFields();
  };

  // Only show error after a field is touched.
  const fieldError: boolean = isFieldTouched('ownerToAdd') && getFieldError('ownerToAdd');

  return (
    <>
      <Table
        size="small"
        pagination={false}
        rowSelection={toAddListRowSelection}
        columns={toAddListColumns}
        dataSource={ownersToAdd}
        bordered
      />

      <Form onSubmit={handleSubmit}>
        <Row type="flex" justify="space-between">
          <Col xs={18}>
            <Form.Item validateStatus={fieldError ? 'error' : ''}>
              {
                getFieldDecorator('ownerToAdd', OwnersToAddValidation)(
                  <Input
                    className="_mt15"
                    placeholder="EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X"
                  />
                )
              }
            </Form.Item>
          </Col>

          <Col>
            <Form.Item>
              <Button
                className="_mt15"
                type="primary"
                htmlType="submit"
                ghost
              >
                Add
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Row type="flex" justify="start">
        <Col>
          {
            ownersToAdd.length
              ? <Button
                className="_mt15"
                type="primary"
                htmlType="submit"
              >
                  Submit
              </Button>
              : null
          }
        </Col>

        <Col>
          {
            selectedOwnersFromToAdd.length
              ? <Button
                type="danger"
                ghost
                className="_mt15 _mb15 _ml15"
                onClick={() => {
                  dispatch(removeOwnersFromToAdd(selectedOwnersFromToAdd));
                  dispatch(selectOwnersFromToAdd([]));
                }}
              >
                Remove
              </Button>
              : null
          }
        </Col>
      </Row>
    </>
  )
};

export const OwnersToAdd: React.ReactElement = Form.create()(OwnersToAddForm);
