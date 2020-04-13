import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
//import dynamic from 'next/dynamic'
//const SidebarCollapsedProvider = dynamic(() => import('../components/utils/SideBarCollapsedContext'), { ssr: false })
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

// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const api = await getApi()
//   const subsocial = new SubsocialApi({ substrateApi: api, ipfsApi: ipfsUrl, offchainUrl});
//   appContext.ctx.subsocial = subsocial;
//   const appProps = await App.getInitialProps(appContext);

//   return { ...appProps }
// }

export default MyApp;
