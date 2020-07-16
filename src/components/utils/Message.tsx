import React from 'react'
import notification, { NotificationPlacement, ArgsProps, IconType } from 'antd/lib/notification'

export type Message = React.ReactNode

export type MessageProps = {
  message: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  placement?: NotificationPlacement,
  duration?: number | null,
  key?: string
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

export const showSuccessMessage = (props: Message | MessageProps) => {
  showMessage(notification.success, props)
}

export const showErrorMessage = (props: Message | MessageProps) => {
  showMessage(notification.error, props)
}

export const showWarnMessage = (props: Message | MessageProps) => {
  showMessage(notification.warn, props)
}

type ControlledMessageProps = MessageProps & {
  type?: IconType
}

export const controlledMessage = ({
  key = `open${new Date().getMilliseconds()}`,
  type,
  placement = DefaultPlacement,
  ...otherProps
}: ControlledMessageProps) => {
  return {
    send: () => {
      notification.open({
        key,
        type,
        placement,
        ...otherProps
      })
    },
    close: () => {
      notification.close(key)
    }
  }
}
