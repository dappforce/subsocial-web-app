import React from 'react'
import { Alert } from 'antd'
import { BareProps } from './types';

export type WarningPanelProps = BareProps & {
  desc: React.ReactNode,
  action?: React.ReactNode
  preview?: boolean,
  withIcon?: boolean,
  centered?: boolean,
  closable?: boolean
}

export const WarningPanel = ({
  desc,
  action,
  centered,
  closable,
  withIcon = false,
  className,
  style
}: WarningPanelProps) => <Alert
    className={`${className}`}
    style={style}
    message={
      <div className={`d-flex align-items-center ${centered ? 'justify-content-center' : 'justify-content-between'}`}>
        {desc}
        {action}
      </div>
    }
    banner
    showIcon={withIcon}
    closable={closable}
    type="warning"
  />

export default WarningPanel;
