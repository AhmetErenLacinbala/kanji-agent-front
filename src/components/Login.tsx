import React, { useState } from 'react'
import { Button, Checkbox, Form, Input, message, Typography } from 'antd'
import type { FormProps } from 'antd'
import ApiService, { API_URL } from '../services/api'

const { Title } = Typography

type FieldType = {
    email?: string
    password?: string
    remember?: boolean
}

const AuthForm: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false)

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login'

            const res = await ApiService.post(`${API_URL}${endpoint}`, {
                email: values.email,
                password: values.password,
            })

            message.success(isRegister ? 'Registered successfully!' : 'Logged in!')
            console.log('Success:', res.data)

            if (res.data.accessToken) {
                localStorage.setItem('accessToken', res.data.accessToken)
                // optionally redirect or update app state
            }
        } catch (err) {
            console.error(err)
            message.error('Auth failed')
        }
    }

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo)
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl">
            <Title level={3} className="text-center">{isRegister ? 'Sign Up' : 'Sign In'}</Title>

            <Form
                name="auth-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType>
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" block>
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </Button>
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="link" block onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Already have an account? Sign in' : 'Don’t have an account? Sign up'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AuthForm
