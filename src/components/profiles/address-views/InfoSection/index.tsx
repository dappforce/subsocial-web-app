import React from 'react';
import { Descriptions as AntdDesc } from 'antd'
import { useResponsiveSize } from 'src/components/responsive';
import { BareProps } from 'src/components/utils/types';
import Section from 'src/components/utils/Section';
import styles from './index.module.sass'

export type DescItem = {
  label: React.ReactNode,
  value: React.ReactNode
}

type InfoPanelProps = BareProps & {
  title?: React.ReactNode
  items?: DescItem[],
  size?: 'middle' | 'small' | 'default',
  column?: number,
  layout?: 'vertical' | 'horizontal'
}

type DescriptionsProps = InfoPanelProps & {
  title: React.ReactNode
  level?: number,
}

export const InfoPanel = ({ title, size = 'small', layout, column = 2, items, ...bareProps }: InfoPanelProps) => {
  const { isMobile } = useResponsiveSize()

  return <AntdDesc
    {...bareProps}
    title={title}
    size={size}
    layout={layout}
    column={isMobile ? 1 : column}
  >
    {items?.map(({ label, value }, key) =>
      <AntdDesc.Item
        key={key}
        label={label}
      >
      {value}
    </AntdDesc.Item>)}
  </AntdDesc>
}

export const InfoSection = ({ title, level, className, style, ...props }: DescriptionsProps) => <Section
    level={level}
    title={title}
    className={`${styles.DfInfoSection} ${className}`}
    style={style}
  >
    <InfoPanel {...props} />
</Section>

export default InfoSection
