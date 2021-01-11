import React from 'react'

export const Step3ButtonName = 'Proceed to faucet on Telegram'

export const Step3Content = React.memo(() => <>
  <p>
    By clicking <b>&quot{Step3ButtonName}&quot</b> button and requesting Tokens in that Telegram chat
    you hereby Agree to
    our <a target='_blank' href='/legal/terms'>Terms of Use</a>{' '}
    and <a target='_blank' href='/legal/privacy'>Privacy Policy</a>.
  </p>
</>)
