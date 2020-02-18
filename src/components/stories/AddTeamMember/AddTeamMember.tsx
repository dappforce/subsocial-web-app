import React from 'react';
import {Form, Input, Button, Select, Switch, DatePicker} from 'antd';
import {FormComponentProps} from 'antd/lib/form/Form';

const {Option} = Select;
const {TextArea} = Input;

//import faker from 'faker';
import './addTeamMember.css';

interface TestFormProps extends FormComponentProps {
    temp: number;
}

type CompanyData = { id: number, name: string, img: string }[];

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class AddTeamMember extends React.Component<TestFormProps> {
    constructor(props: TestFormProps) {
        super(props);
        this.state = {
            companyAutocomplete: [],
            companyFieldPrefix: '',
            currentlyWorkingField: true
        };
    }

    componentDidMount() {
        // To disable submit button at the beginning.
        this.props.form.validateFields();
        console.log(this.state.currentlyWorkingField);
    }

    handleCompanyChange = () => {
        let companyData: CompanyData =
            [{
                id: 0,
                name: "Web3 Foundation",
                img: 'https://pbs.twimg.com/profile_images/1162751266432442369/cjjjE5un_400x400.png'
            }];
        let fieldValue = this.props.form.getFieldValue('company');

        this.setState({
            companyFieldPrefix: ''
        });

        if (fieldValue) {
            fieldValue.toLowerCase();

            let results = companyData.filter(function (item) {
                return item.name.toLowerCase().includes(fieldValue);
            });

            if (results) {
                this.setState({
                    companyAutocomplete: results
                });
            }
            console.log(results);
        }
    };

    handleAutocomplete = (data) => {
        this.props.form.setFieldsValue({
            'company': data.name,
        });

        this.setState({
            companyAutocomplete: [],
            companyFieldPrefix: data.img
        });
    };

    handleSwitchChange = () => {
        let fieldValue = this.props.form.getFieldValue('switch');

        this.setState({
            currentlyWorkingField: !fieldValue
        });

    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    };

    render() {
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;

        // Only show error after a field is touched.
        const titleError = isFieldTouched('username') && getFieldError('username');
        const companyError = isFieldTouched('company') && getFieldError('company');
        const locationError = isFieldTouched('location') && getFieldError('location');
        const startDateError = isFieldTouched('startDate') && getFieldError('startDate');
        const endDateError = isFieldTouched('endDate') && getFieldError('endDate');
        const descriptionError = isFieldTouched('description') && getFieldError('description');
        return (
            <div className={'add_team_member'}>
                <Form layout="vertical" onSubmit={this.handleSubmit}>
                    <Form.Item validateStatus={titleError ? 'error' : ''} help={titleError || ''}>
                        <div className={'atm_input_label atm_required'}>Title</div>
                        {getFieldDecorator('username', {
                            rules: [{required: true, message: 'Please input title!'}],
                        })(
                            <Input
                                placeholder="Title"
                            />,
                        )}
                    </Form.Item>

                    <Form.Item>
                        <div className={'atm_input_label'}>Employment Type</div>
                        {getFieldDecorator('employment_type', {
                            rules: [{required: false, message: 'Please select your employment type!'}],
                        })(
                            <Select
                                placeholder="-"
                            >
                                <Option value="type1">type1</Option>
                                <Option value="type2">type2</Option>
                            </Select>,
                        )}
                    </Form.Item>

                    <Form.Item validateStatus={companyError ? 'error' : ''} help={companyError || ''}>
                        <div className={'atm_input_label atm_required'}>Company</div>
                        {getFieldDecorator('company', {
                            rules: [{required: true, message: 'Please input company name!'}],
                        })(
                            <Input
                                prefix={this.state.companyFieldPrefix ?
                                    <img className={'atm_prefix'} src={this.state.companyFieldPrefix}/> : ''}
                                placeholder="Company"
                                onChange={this.handleCompanyChange}
                            />,
                        )}
                        {this.state.companyAutocomplete.map((i) => {
                            return (
                                <div className={'atm_company_autocomplete'}
                                     key={`${i.id}`}
                                     onClick={() => this.handleAutocomplete(i)}>
                                    <img src={i.img}/>
                                    <span>{i.name}</span>
                                </div>
                            );
                        })}
                    </Form.Item>

                    <Form.Item validateStatus={locationError ? 'error' : ''} help={locationError || ''}>
                        <div className={'atm_input_label'}>Location</div>
                        {getFieldDecorator('location', {
                            rules: [{required: false, message: 'Please input location!'}],
                        })(
                            <Input
                                placeholder="Ex: London, United Kingdom"
                            />,
                        )}
                    </Form.Item>

                    <Form.Item>
                        {getFieldDecorator('switch', {
                            valuePropName: 'checked',
                            initialValue: this.state.currentlyWorkingField
                        })(<Switch onChange={this.handleSwitchChange}/>)}
                        <div className={'atm_switch_label'}>I am currently working in this role.</div>
                    </Form.Item>
                    <div className={'atm_dates_wrapper'}>
                        <Form.Item validateStatus={startDateError ? 'error' : ''} help={startDateError || ''}
                                   className={'atm_start_date'}>
                            <div className={'atm_input_label atm_required'}>Start Date</div>
                            {getFieldDecorator('startDate', {
                                rules: [{required: true, message: 'Please input start date!'}],
                            })(<DatePicker/>)}
                        </Form.Item>
                        {this.state.currentlyWorkingField === true ?
                            <div className={'atm_endDate_filler'}>
                                <div className={'atm_input_label'}>End Date</div>
                                <div>Present</div>
                            </div>
                            :
                            <Form.Item validateStatus={endDateError ? 'error' : ''} help={endDateError || ''}>
                                <div className={'atm_input_label atm_required'}>End Date</div>
                                {getFieldDecorator('endDate', {
                                    rules: [{required: true, message: 'Please input end date!'}],
                                })(<DatePicker/>)}
                            </Form.Item>
                        }
                    </div>

                    <Form.Item validateStatus={descriptionError ? 'error' : ''} help={descriptionError || ''}>
                        <div className={'atm_input_label'}>Description</div>
                        {getFieldDecorator('description', {
                            rules: [{required: false, message: 'Please input your description!'}],
                        })(
                            <TextArea
                                autoSize={{minRows: 3, maxRows: 5}}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

const WrappedAddTeamMember = Form.create<TestFormProps>({name: 'add_team_member'})(AddTeamMember);


export default WrappedAddTeamMember;