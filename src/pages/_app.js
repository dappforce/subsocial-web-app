import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { getApi, ipfsUrl, offchainUrl } from '../components/utils/SubsocialConnect';
import { SubsocialApi } from '@subsocial/api/fullApi';

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
