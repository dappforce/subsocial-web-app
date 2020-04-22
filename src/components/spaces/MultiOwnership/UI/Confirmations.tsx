import React, { useContext } from 'react';

// Components
import { Form, InputNumber, Button, Row, Col, Typography } from 'antd';
import { DividerMargin } from './DividerMargin';

// Context
import { reducer, initialState } from '../context/reducer';
import { Context } from '../context/context';

// Validation
import { ConfirmationsValidation } from '../validation';

// Types
import { ConfirmationsFormProps, MainContext } from '../types';

// SubComponents
const { Text }: any = Typography;

const ConfirmationsForm: React.FC<ConfirmationsFormProps> = ({
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
      confirmationsRequired,
      currentConfirmationsNumber
    },
    dispatch
  } = useContext<MainContext>(Context);

  const handleSubmit = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();

    validateFields((err: any, values: any) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });

    resetFields();
  };

  // Only show error after a field is touched.
  const confirmationsError: boolean = isFieldTouched('confirmations') && getFieldError('confirmations');

  return (
    <div className="_mt30">
      <Text>
        {confirmationsRequired} confirmations required
      </Text>

      <DividerMargin />

      <Form onSubmit={handleSubmit}>
        <Row type="flex" justify="space-between">
          <Col xs={17}>
            <Form.Item validateStatus={confirmationsError ? 'error' : ''}>
              {
                getFieldDecorator('confirmations', ConfirmationsValidation)(
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="1"
                  />
                )
              }
            </Form.Item>
          </Col>

          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export const Confirmations = Form.create()(ConfirmationsForm);
