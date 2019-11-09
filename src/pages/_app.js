import React from 'react'
import App from 'next/app';
import MainPage from '../layout/MainPage'

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <MainPage>
        <Component {...pageProps}></Component>
      </MainPage>
    )
  }
}

export default MyApp;