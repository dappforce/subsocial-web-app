import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
import { Provider } from 'react-redux';
import store from 'src/redux/store';

// TODO remove global import of all AntD CSS, use modular LESS loading instead.
import 'antd/dist/antd.css';
import 'antd-mobile/dist/antd-mobile.css';

import 'src/components/utils/styles/bootstrap-utilities-4.3.1.css';
import 'src/components/utils/styles/app.scss';
import 'src/components/utils/styles/components.scss';
import 'src/components/utils/styles/github-markdown.css';
import 'src/components/utils/styles/subsocial.scss';
import 'src/components/utils/styles/utils.scss';
import 'src/components/utils/styles/subsocial-mobile.scss';

import 'easymde/dist/easymde.min.css';

function MyApp (props) {
  const { Component, pageProps } = props
  return (
    <>
      <Head>
        <script src="/env.js" />
      </Head>
      <Provider store={store}>
        <MainPage>
          <Component {...pageProps} />
        </MainPage>
      </Provider>
    </>
  )
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps }
}

export default MyApp;
