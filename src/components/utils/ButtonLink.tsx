import React from 'react'
import Button, { ButtonProps } from 'antd/lib/button'
import Link from 'next/link'

type ButtonLinkProps = ButtonProps & {
  href: string,
  as?: string
}

export const ButtonLink = ({ as, href, children, ...buttonProps }: ButtonLinkProps) =>
  <Button {...buttonProps}>
    <Link href={href} as={as}>
      <a>
        {children}
      </a>
    </Link>
  </Button>

export default ButtonLink
