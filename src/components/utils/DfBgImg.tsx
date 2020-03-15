import React, { CSSProperties } from 'react';

type Props = {
  src: string,
  size?: number | string,
  height?: number | string,
  width?: number | string,
  rounded?: boolean,
  className?: string,
  style?: CSSProperties
};

export function DfBgImg (props: Props) {
  const { src, size, height = size, width = size, rounded = false, className, style } = props;

  const fullClass = 'DfBgImg ' + className;

  const fullStyle = Object.assign({
    backgroundImage: `url(${src})`,
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    borderRadius: rounded ? '50%' : '0'
  }, style);

  return <div className={fullClass} style={fullStyle} />;
}
