import React from 'react';
import { BareProps } from 'src/components/utils/types';

type Props = BareProps & {
  id?: string,
  className?: string,
  title?: React.ReactNode,
  level?: number
};

export class Section extends React.PureComponent<Props> {
  render () {
    let { id, className, children } = this.props;
    className = (className || '') + ' DfSection';

    return (
      <div className='DfSectionOuter'>
        <section id={id} className={className}>
          {this.renderTitle()}
          {children}
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

export default Section
