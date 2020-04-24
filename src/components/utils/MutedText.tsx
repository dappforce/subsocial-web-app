import React from 'react';

type Props = React.PropsWithChildren<{
  smaller?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<any>
}>;

function getClassNames (props: Props): string {
  const { smaller = false, className } = props;
  return `MutedText grey text ${smaller ? 'smaller' : ''} ${className}`;
}

export const MutedSpan = (props: Props) => {
  const { style, onClick, children } = props;
  return <span className={getClassNames(props)} style={style} onClick={onClick}>{children}</span>;
};

export const MutedDiv = (props: Props) => {
  const { style, onClick, children } = props;
  return <div className={getClassNames(props)} style={style} onClick={onClick}>{children}</div>;
};
