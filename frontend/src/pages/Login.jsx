import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useAuth } from '../AuthContext';
import { loginUser } from '../api';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await loginUser(values.email, values.password);
      login(res.token);
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="fade-in" style={{ color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',overflowX:'hidden' }}>
      <Card className='glass-card' style={{ width: 350 }}>
        <Typography.Title level={3} style={{ textAlign: 'center',color:'white' }}>Login</Typography.Title>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: '', password: '' }}>
          <Form.Item name="email" label={<span style={{color:'white'}}>Email</span>} rules={[{ required: true, message: 'Please enter your email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="password" label={<span style={{color:'white'}}>Password</span>} rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Login</Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16 ,color:'white'  }}>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

export default Login; 