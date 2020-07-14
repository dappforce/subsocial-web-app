// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
// import { Input, Button } from 'antd';
// import React from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import * as Yup from 'yup';

// const buildValidationSchema = () => Yup.object().shape({

//   send: Yup.string()
//     .required('Send is required')
//     .min(5, 'Min length is 5')
// })

// export default {
//   title: 'Form | SimpleLogin'
// }

// const NormalLoginForm = () => {

//   const { control, errors, watch, handleSubmit } = useForm({
//     validationSchema: buildValidationSchema()
//   })

//   const handle = (data) => {
//     console.log(data)
//   }

//   return (
//     <Form onSubmit={handleSubmit(handle)} className="login-form">
//       <Form.Item
//         help={errors['send']?.message || 'You Send'}
//         validateStatus={errors['send'] ? 'error' : 'success'}
//       >
//         <Controller
//           as={<Input placeholder="Send" />}
//           name='send'
//           control={control}
//         />
//       </Form.Item>
//       <Button type="primary" htmlType="submit">
//         Submit
//       </Button>
//     </Form>
//   );
// }

// export const _WrappedNormalLoginForm = NormalLoginForm;
