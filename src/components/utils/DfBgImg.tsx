import React, { CSSProperties } from 'react';
import { resolveIpfsUrl } from 'src/ipfs';
import Link, { LinkProps } from 'next/link';

export type BgImgProps = {
  src: string,
  size?: number | string,
  height?: number | string,
  width?: number | string,
  rounded?: boolean,
  className?: string,
  style?: CSSProperties
};

export function DfBgImg (props: BgImgProps) {
  const { src, size, height = size, width = size, rounded = false, className, style } = props;

  const fullClass = 'DfBgImg ' + className;

  const fullStyle = Object.assign({
    backgroundImage: `url(${resolveIpfsUrl(src)})`,
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    borderRadius: rounded && '50%'
  }, style);

  return <div className={fullClass} style={fullStyle} />;
}

type DfBgImageLinkProps = BgImgProps & LinkProps

export const DfBgImageLink = ({ href, as, ...props }: DfBgImageLinkProps) => <div>
    <Link href={href} as={as}>
      <a>
        <DfBgImg {...props}/>
      </a>
    </Link>
  </div>
