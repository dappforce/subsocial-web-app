export type SubstrateAddress = {
  address: string;
  img: string;
}

export type SubstrateAccount = {
  key: string;
  account: SubstrateAddress
}

export type ConfirmationsFormProps = {
  form: {
    getFieldDecorator: any;
    getFieldError: any;
    isFieldTouched: any;
    validateFields: any;
    resetFields: any;
  }
}

export type ChangeRowType = {
  key: number;
  confirmationsRequired: number;
  confirmations: number;
  id: number;
  time: string;
  note: string;
  response: string;
}

export type MainContext = {
  state: {
    confirmationsRequired: number;
    currentConfirmationsNumber: number;
    toAddInput: string;
    owners: Array<SubstrateAccount>;
    ownersToAdd: Array<SubstrateAccount>;
    selectedOwnersFromMain: Array<SubstrateAccount>;
    selectedOwnersFromToAdd: Array<SubstrateAccount>;
    changes: Array<ChangeRowType>;
  };
  dispatch: any;
}

export type OwnersListColumnsType = {
  title: string;
  dataIndex: string;
  render: (account: SubstrateAddress) => React.ReactElement;
};

export type ChangeTabType = {
  name: string;
  filters: Array<string>;
  key: string;
}
