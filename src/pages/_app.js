import React from 'react'
import App from 'next/app';
import Head from 'next/head';
import MainPage from '../layout/MainPage'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';

class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <SidebarCollapsedProvider>
        <Head>
          <script src="/env.js"/>
        </Head>
        <MainPage>
          <Component {...pageProps}/>
        </MainPage>
      </SidebarCollapsedProvider>
    )
  }
}

export default MyApp;
