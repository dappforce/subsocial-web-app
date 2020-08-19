import React from 'react'
import { Form, Input, Button, Space, Collapse } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
const { Panel } = Collapse;

type SocialLinksProps = {
  links?: string[] | NamedLinks[],
}

type NamedLinks = {
  name: string,
  url?: string
}

type NewSocialLinksProps = SocialLinksProps & {
  name: string,
  isDynamic?: boolean
}
type InnerFilmListFn = (fields: FormListFieldData[], operation: FormListOperation) => React.ReactNode;

const staticLinkLabels = [ 'Email', 'Facebook', 'Twitter', 'Medium', 'LinkedIn', 'Github', 'Instagram', 'Presinal site' ]

const staticSocialLinks = (): InnerFilmListFn => {
  return (fields) => {
    staticLinkLabels.forEach((_, index) => {
      const i = index + 1
      fields.push({ name: i, key: i, fieldKey: i })
    })
    return (
      <div>
        {fields.map((field, index) => {
          const label = staticLinkLabels[index]
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
    );
  }
}

const dynamicSocialLinks = ({ links }: SocialLinksProps): InnerFilmListFn => {
  return (fields, { add, remove }) => {
    links && (links as NamedLinks[]).forEach(({ name, url }) => add({ name, url }))

    return (
      <div>
        {fields.map(field => (
          <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
            <Form.Item
              {...field}
              name={[ field.name, 'name' ]}
              fieldKey={[ field.fieldKey, 'name' ]}
              rules={[ { required: true, message: 'Missing social link name' } ]}
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
            <PlusOutlined /> Add field
          </Button>
        </Form.Item>
      </div>
    );
  }
}

const StaticSocialLinks = ({ name, ...props }: NewSocialLinksProps) => (
  <Collapse expandIconPosition='right' ghost>
    <Panel header={<h4 className='text-right m-0'>Social links</h4>} key="1">
      <Form.List name={name}>
        {staticSocialLinks()}
      </Form.List>
    </Panel>
  </Collapse>
)

const DynamicSociaLinks = ({ name, ...props }: NewSocialLinksProps) => (
  <Form.Item
    label='Social links'
  >
    <Form.List name={name}>
      {dynamicSocialLinks({ ...props })}
    </Form.List>
  </Form.Item>
)

export const NewSocialLinks = ({ isDynamic, ...props }: NewSocialLinksProps) => {
  return isDynamic
    ? <DynamicSociaLinks {...props} />
    : <StaticSocialLinks {...props} />

}
