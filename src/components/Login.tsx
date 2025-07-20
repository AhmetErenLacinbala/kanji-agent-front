import React, { useState } from 'react'
import { Button, Checkbox, Form, Input, message, Typography } from 'antd'
import type { FormProps } from 'antd'
import { useAuthStore } from '../stores/authStore'

const { Title } = Typography

type FieldType = {
    emailOrUsername?: string
    email?: string
    password?: string
    username?: string
    remember?: boolean
}

interface AuthFormProps {
    onSuccess?: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
    const [isRegister, setIsRegister] = useState(false)
    const { login, register, isLoading } = useAuthStore()

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            if (isRegister) {
                await register({
                    email: values.email!,
                    username: values.username!,
                    password: values.password!
                })
                message.success('Registered and logged in successfully!')
            } else {
                await login({
                    emailOrUsername: values.emailOrUsername!,
                    password: values.password!
                })
                message.success('Logged in successfully!')
            }
            // Close the modal after successful auth
            onSuccess?.()
        } catch (err) {
            console.error(err)
            message.error(isRegister ? 'Registration failed' : 'Login failed')
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
                {isRegister ? (
                    <>
                        <Form.Item<FieldType>
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </>
                ) : (
                    <Form.Item<FieldType>
                        label="Email/Username"
                        name="emailOrUsername"
                        rules={[{ required: true, message: 'Please input your email or username!' }]}
                    >
                        <Input placeholder="Enter email or username" />
                    </Form.Item>
                )}

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
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </Button>
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="link" block onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AuthForm
