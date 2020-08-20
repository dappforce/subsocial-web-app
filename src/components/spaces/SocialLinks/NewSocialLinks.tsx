import React from 'react'
import { Form, Input, Button, Space, Collapse } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
const { Panel } = Collapse;

type NewSocialLinksProps = {
  name: string,
  collapsed: boolean,
  isDynamic?: boolean
}
type InnerFilmListFn = (fields: FormListFieldData[], operation: FormListOperation) => React.ReactNode;

const staticLinkLabels = [ 'Presonal site', 'Twitter', 'Medium', 'GitHub', 'Facebook', 'LinkedIn', 'Instagram' ]

const staticSocialLinks = (): InnerFilmListFn => {
  return (fields) => <div>
    {staticLinkLabels.map((label, index) => {
      const field = fields[index] || { name: index, key: index, fieldKey: index }
      return <Form.Item
        {...field}
        label={label}
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder={`${label} URL`} />
      </Form.Item>
    })}
  </div>
}

const dynamicSocialLinks = (): InnerFilmListFn => {
  return (fields, { add, remove }) => {

    return (
      <div>
        {fields.map(field => (
          <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
            <Form.Item
              {...field}
              name={[ field.name, 'name' ]}
              fieldKey={[ field.fieldKey, 'name' ]}
              rules={[ { required: true, message: 'Should be a valid link name' } ]}
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item
              {...field}
              name={[ field.name, 'url' ]}
              fieldKey={[ field.fieldKey, 'url' ]}
              rules={[
                { required: true, message: 'Missing url' },
                { type: 'url', message: 'Should be a valid URL.' }
              ]}
            >
              <Input placeholder="Url" />
            </Form.Item>

            <MinusCircleOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          </Space>
        ))}

        <Form.Item>
          <Button
            type="dashed"
            onClick={() => {
              add();
            }}
            block
          >
            <PlusOutlined /> Add link
          </Button>
        </Form.Item>
      </div>
    );
  }
}

const StaticSocialLinks = ({ name, collapsed }: NewSocialLinksProps) => (
  <Collapse defaultActiveKey={collapsed ? undefined : [ name ]} ghost>
    <Panel header={<h3 className='m-0'>Social links</h3>} key={name}>
      <Form.List name={name}>
        {staticSocialLinks()}
      </Form.List>
    </Panel>
  </Collapse>
)

const DynamicSociaLinks = ({ name }: NewSocialLinksProps) => (
  <Form.Item
    label='Social links'
  >
    <Form.List name={name}>
      {dynamicSocialLinks()}
    </Form.List>
  </Form.Item>
)

export const NewSocialLinks = ({ isDynamic, ...props }: NewSocialLinksProps) => {
  return isDynamic
    ? <DynamicSociaLinks {...props} />
    : <StaticSocialLinks {...props} />

}
