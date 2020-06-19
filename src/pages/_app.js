import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
import { Provider } from 'react-redux';
import store from 'src/app/store';

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
