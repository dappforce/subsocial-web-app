import React from 'react'
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

export default MyApp;
