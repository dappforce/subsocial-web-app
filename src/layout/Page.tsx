import React from 'react';
import Head from 'next/head';
import { createTitle } from '../components/utils';

type Props = {
  title?: string
};

const Layout: React.FunctionComponent<Props> = ({ children, title = 'This is the default title' }) => {

  return <div>
    <Head>
      <title>{createTitle(title)}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <link rel='shortcut icon' href='/images/favicon.ico' />
    </Head>
    {children}
  </div>;
};

export default Layout;
