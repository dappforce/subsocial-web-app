import React from 'react'
import WarningPanel, { WarningPanelProps } from '../WarningPanel'
import styles from './index.module.sass'

export type EntityStatusProps = Partial<WarningPanelProps>

export const EntityStatusPanel = ({
  desc,
  actions,
  preview = false,
  centered = false,
  withIcon = true,
  className,
  style
}: EntityStatusProps) => {

  const alertCss = preview
    ? styles.DfEntityStatusInPreview
    : styles.DfEntityStatusOnPage

  return <WarningPanel
    className={`${styles.DfEntityStatus} ${alertCss} ${className}`}
    style={style}
    desc={desc}
    actions={actions}
    centered={centered}
    withIcon={withIcon}
  />
}

type EntityStatusGroupProps = React.PropsWithChildren<{}>

export const EntityStatusGroup = ({ children }: EntityStatusGroupProps) =>
  children 
  ? <div className={styles.DfEntityStatusGroup}>
      {children}
    </div>
  : null
