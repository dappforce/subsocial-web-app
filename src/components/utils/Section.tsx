import React from 'react';
import { BareProps } from '@polkadot/react-components/types';

type Props = BareProps & {
  id?: string,
  className?: string,
  title?: JSX.Element | string,
  level?: number
};

export default class Section extends React.PureComponent<Props> {
  render () {
    let { id, className, children } = this.props;
    className = (className || '') + ' DfSection';

    return (
      <div className='DfSectionOuter'>
        <section id={id} className={className}>
          {this.renderTitle()}
          <div>{children}</div>
        </section>
      </div>
    );
  }

  private renderTitle = () => {
    const { title, level = 2 } = this.props;
    if (!title) return null;

    const className = 'DfSection-title';
    return React.createElement(
      `h${level}`,
      { className },
      title
    );
  }
}
