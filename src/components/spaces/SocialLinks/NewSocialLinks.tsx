import React from 'react'
import { Form, Input, Button, Space, Collapse } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import { getLinkIcon, hasSocialMediaProfiles, LinkLabel, getLinkBrand } from './utils';
import { NamedLinks } from '@subsocial/types';
const { Panel } = Collapse;

type NewSocialLinksProps = {
  name: string,
  collapsed: boolean,
  links?: string[] | NamedLinks[],
  isDynamic?: boolean
}

type InnerFieldListFn = (fields: FormListFieldData[], operation: FormListOperation) => React.ReactNode;

const staticLinkLabels: LinkLabel[] = [
  'Website',
  'Twitter',
  'Medium',
  'Telegram',
  'GitHub',
  'Facebook',
  'LinkedIn',
  'Instagram',
  'YouTube'
]

const resovleLabels = (links?: string[]) => {
  const labelsWithLinks: LinkLabel[] = links
    ? links.map(x => getLinkBrand(x) || 'Website')
    : []

  return links
    ? [
        ...labelsWithLinks,
        ...staticLinkLabels
          .filter(x => !labelsWithLinks.includes(x))
      ]
    : staticLinkLabels
}

const staticSocialLinks = (links?: string[]): InnerFieldListFn => {
  const labels = resovleLabels(links)

  return (fields) => <div>
    {labels.map((label, index) => {
      const field = fields[index] || { name: index, key: index, fieldKey: index }
      const icon = getLinkIcon(label)
      const hasProfiles = hasSocialMediaProfiles(label)
      const placeholder = hasProfiles ? `${label} profile URL` : `${label} URL`

      return <Form.Item
        {...field}
        label={<span>
          {icon}
          <span className='ml-2'>
            {label}
          </span>
        </span>}
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder={placeholder} />
      </Form.Item>
    })}
  </div>
}

const dynamicSocialLinks = (): InnerFieldListFn => {
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
                { required: true, message: 'Missing URL' },
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

const StaticSocialLinks = ({ name, collapsed, links }: NewSocialLinksProps) => (
  <Collapse defaultActiveKey={collapsed ? undefined : [ name ]} ghost>
    <Panel header={<h3 className='m-0'>Social links</h3>} key={name}>
      <Form.List name={name}>
        {staticSocialLinks(links as string[])}
      </Form.List>
    </Panel>
  </Collapse>
)

const DynamicSociaLinks = ({ name }: NewSocialLinksProps) => (
  <Form.Item label='Social links'>
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
