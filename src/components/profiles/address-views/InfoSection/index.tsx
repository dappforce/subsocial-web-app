import React from 'react';
import { Descriptions as AntdDesc } from 'antd'
import { useResponsiveSize } from 'src/components/responsive';
import { BareProps } from 'src/components/utils/types';
import Section from 'src/components/utils/Section';
import styles from './index.module.sass'

type DescItem = {
  label: React.ReactNode,
  value: React.ReactNode
}

type DescriptionsProps = BareProps & {
  title: React.ReactNode
  level?: number,
  items?: DescItem[],
  size?: 'middle' | 'small' | 'default',
  column?: number,
  layout?: 'vertical' | 'horizontal'
}


export const InfoSection = ({ title, size = 'small', level, layout, column = 2, items, className, ...bareProps }: DescriptionsProps) => {
  const { isMobile } = useResponsiveSize()

  return <Section
      level={level}
      title={title}
      className={`${styles.DfInfoSection} ${className}`}
      {...bareProps}
    >
      <AntdDesc
        size={size}
        layout={layout || isMobile ? 'vertical' : 'horizontal'}
        column={isMobile ? 1 : column}
        className='mt-2'
      >
        {items?.map(({ label, value }, key) =>
          <AntdDesc.Item
            key={key}
            label={label}
          >
          {value}
        </AntdDesc.Item>)}
      </AntdDesc>
  </Section>
}

export default InfoSection
