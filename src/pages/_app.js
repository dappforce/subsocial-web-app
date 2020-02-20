import React from 'react'
import App from 'next/app';
import MainPage from '../layout/MainPage'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';

class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <SidebarCollapsedProvider>
        <MainPage>
          <Component {...pageProps}/>
        </MainPage>
      </SidebarCollapsedProvider>
    )
  }
}

export default MyApp;
