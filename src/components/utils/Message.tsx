import React from 'react'
import notification, { NotificationPlacement, ArgsProps } from 'antd/lib/notification'

export type Message = React.ReactNode

export type MessageProps = {
  message: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  placement?: NotificationPlacement
}

const DefaultPlacement: NotificationPlacement = 'bottomLeft'

const showMessage = (
  notifFn: (args: ArgsProps) => void,
  props: Message | MessageProps
) => {
  if (typeof props === 'object' && (props as MessageProps).message) {
    const { placement = DefaultPlacement, ...msgProps } = props as MessageProps
    notifFn({ ...msgProps, placement })
  } else {
    notifFn({ message: props as Message, placement: DefaultPlacement })
  }
}

export const showInfoMessage = (props: Message | MessageProps) => {
  showMessage(notification.info, props)
}

export const showSuccessMessage = (props: Message | MessageProps) => {
  showMessage(notification.success, props)
}

export const showErrorMessage = (props: Message | MessageProps) => {
  showMessage(notification.error, props)
}
