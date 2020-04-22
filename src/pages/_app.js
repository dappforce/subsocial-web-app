import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';

function MyApp (props) {
  const { Component, pageProps } = props
  return (
    <SidebarCollapsedProvider>
      <Head>
        <script src="/env.js" />
      </Head>
      <MainPage>
        <Component {...pageProps} />
      </MainPage>
    </SidebarCollapsedProvider>
  )
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps }
}

export default MyApp;
