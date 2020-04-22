export const ConfirmationsValidation = {
  rules: [
    {
      required: true,
      pattern: new RegExp('^[0-9]*$'),
      message: 'Please input confirmations number!'
    }
  ]
}

export const OwnersToAddValidation = {
  rules: [
    {
      required: true,
      pattern: new RegExp('.{47}$'),
      message: 'Please input owner\'s address!'
    }
  ]
}
