import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../AuthContext";
import { signupUser } from "../api";
import "../App.css";

const { Title, Paragraph } = Typography;

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await signupUser(values.email, values.name, values.password);
      login(res.token);
      message.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Signup failed";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        color: "white",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card className="glass-card" style={{ width: "100%", maxWidth: 400 }}>
        <Title
          level={3}
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: 24,
          }}
        >
          Create Account
        </Title>
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: "", email: "", password: "" }}
          size="large"
        >
          <Form.Item
            name="name"
            label={<span style={{ color: "white" }}>Full Name</span>}
            rules={[
              { required: true, message: "Please enter your name" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 50, message: "Name must be less than 50 characters" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={<span style={{ color: "white" }}>Email Address</span>}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: "white" }}>Password</span>}
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </Form.Item>
        </Form>
        <Paragraph
          style={{
            textAlign: "center",
            marginTop: 16,
            marginBottom: 0,
            color: "white",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#1890ff",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </Paragraph>
      </Card>
    </div>
  );
}

export default Signup;
