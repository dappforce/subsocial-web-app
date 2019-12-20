import React from 'react'
import App from 'next/app';
import MainPage from '../layout/MainPage'

class MyApp extends App {
  state = {
    isClient: false
  };

  componentDidMount() {
    this.setState({
      isClient: true
    });
  };

  render() {
    console.log('>>>>>>>>>>>>>> isClient: ', this.state.isClient);
    const { Component, pageProps } = this.props
    return (
      <MainPage isClient={this.state.isClient}>
        <Component {...pageProps}/>
      </MainPage>
    )
  }
}

export default MyApp;