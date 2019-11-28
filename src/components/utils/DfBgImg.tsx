import React, { CSSProperties } from 'react';

type Props = {
  src: string,
  size: number,
  rounded?: boolean,
  className?: string,
  style?: CSSProperties
};

export function DfBgImg (props: Props) {
  const { src, size, rounded = true, className, style } = props;

  const fullClass = 'DfBgImg ' + className;

  const fullStyle = Object.assign({
    backgroundImage: `url(${src})`,
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: rounded ? '50%' : '0'
  }, style);

  return <div className={fullClass} style={fullStyle} />;
}
