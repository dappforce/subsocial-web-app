import React from 'react'
import Button, { ButtonProps } from 'antd/lib/button'
import Link from 'next/link'

type ButtonLinkProps = ButtonProps & {
  href: string,
  as?: string,
  target?: string
}

export const ButtonLink = ({ as, href, target, children, ...buttonProps }: ButtonLinkProps) =>
  <Button {...buttonProps}>
    <Link href={href} as={as}>
      <a target={target}>
        {children}
      </a>
    </Link>
  </Button>

export default ButtonLink
