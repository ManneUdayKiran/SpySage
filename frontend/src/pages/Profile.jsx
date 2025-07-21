import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Alert,
  Avatar,
  Upload,
  Modal,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EditOutlined,
  CameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../AuthContext";
import { getProfile, updateProfile } from "../api";
import "../App.css";

const { Title } = Typography;

// Custom hook for responsive design
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile };
}

function Profile() {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const { isMobile } = useResponsive();

  // Predefined avatar options
  const avatarOptions = [
    { id: 1, icon: <UserOutlined />, color: "#1890ff" },
    { id: 2, icon: <UserOutlined />, color: "#52c41a" },
    { id: 3, icon: <UserOutlined />, color: "#faad14" },
    { id: 4, icon: <UserOutlined />, color: "#f5222d" },
    { id: 5, icon: <UserOutlined />, color: "#722ed1" },
    { id: 6, icon: <UserOutlined />, color: "#fa8c16" },
    { id: 7, icon: <UserOutlined />, color: "#13c2c2" },
    { id: 8, icon: <UserOutlined />, color: "#eb2f96" },
  ];

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getProfile(token);
      setProfileData(data);
      // Set initial avatar if exists in profile data
      if (data.avatar) {
        if (data.avatar.startsWith("http") || data.avatar.startsWith("data:")) {
          setUploadedAvatar(data.avatar);
        } else {
          setSelectedAvatar(parseInt(data.avatar));
        }
      }
      form.setFieldsValue({
        name: data.name || "",
        email: data.email || "",
        password: "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.error || "Failed to load profile");
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        name: values.name,
      };

      // Include avatar data
      if (uploadedAvatar) {
        updateData.avatar = uploadedAvatar;
      } else if (selectedAvatar) {
        updateData.avatar = selectedAvatar.toString();
      }

      // Only include password if it's provided
      if (values.password && values.password.trim()) {
        updateData.password = values.password;
      }

      await updateProfile(token, updateData);
      message.success("Profile updated successfully!");

      // Update local profile data
      setProfileData((prev) => ({
        ...prev,
        name: values.name,
        avatar: updateData.avatar,
      }));

      // Clear password field after successful update
      form.setFieldsValue({ password: "" });
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to update profile";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setUploadedAvatar(null); // Clear uploaded avatar when selecting predefined
  };

  const handleUploadChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedAvatar(e.target.result);
        setSelectedAvatar(null); // Clear selected avatar when uploading
        message.success("Avatar uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentAvatar = () => {
    if (uploadedAvatar) {
      return { src: uploadedAvatar };
    }
    if (selectedAvatar) {
      const avatar = avatarOptions.find((a) => a.id === selectedAvatar);
      return avatar
        ? { icon: avatar.icon, style: { backgroundColor: avatar.color } }
        : { icon: <UserOutlined /> };
    }
    // Check profile data for existing avatar
    if (profileData?.avatar) {
      if (
        profileData.avatar.startsWith("http") ||
        profileData.avatar.startsWith("data:")
      ) {
        return { src: profileData.avatar };
      } else {
        const avatarId = parseInt(profileData.avatar);
        const avatar = avatarOptions.find((a) => a.id === avatarId);
        return avatar
          ? { icon: avatar.icon, style: { backgroundColor: avatar.color } }
          : { icon: <UserOutlined /> };
      }
    }
    return { icon: <UserOutlined /> };
  };

  return (
    <div
      className="fade-in"
      style={{ color: "white", padding: isMobile ? 16 : 24 }}
    >
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Title
          level={2}
          style={{ color: "white", textAlign: "center", marginBottom: 32 }}
        >
          <UserOutlined /> Profile Settings
        </Title>

        <Card
          className="glass-card"
          style={{
            width: isMobile ? "100%" : 500,
            maxWidth: "100%",
          }}
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
              action={
                <Button size="small" onClick={fetchProfile}>
                  Retry
                </Button>
              }
            />
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: "white" }}>
                Loading profile...
              </div>
            </div>
          ) : (
            <>
              {/* Avatar Section */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <Avatar
                  size={120}
                  {...getCurrentAvatar()}
                  style={{
                    border: "4px solid rgba(255,255,255,0.2)",
                    ...getCurrentAvatar().style,
                  }}
                />
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    onClick={() => setAvatarModalVisible(true)}
                    style={{
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    Edit Photo
                  </Button>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size={isMobile ? "large" : "middle"}
                key={profileData?.email || "profile-form"} // Add unique key to prevent duplicate IDs
              >
                <Form.Item
                  name="email"
                  label={<span style={{ color: "white" }}>Email Address</span>}
                >
                  <Input
                    disabled
                    prefix={<MailOutlined />}
                    placeholder="Loading..."
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    id="profile-email" // Add unique ID
                  />
                </Form.Item>

                <Form.Item
                  name="name"
                  label={<span style={{ color: "white" }}>Display Name</span>}
                  rules={[
                    { required: true, message: "Please enter your name" },
                    { min: 2, message: "Name must be at least 2 characters" },
                    {
                      max: 50,
                      message: "Name must be less than 50 characters",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your name"
                    id="profile-name" // Add unique ID
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ color: "white" }}>New Password</span>}
                  extra={
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "12px",
                      }}
                    >
                      Leave blank to keep your current password. Must be at
                      least 6 characters if changing.
                    </span>
                  }
                  rules={[
                    {
                      min: 6,
                      message: "Password must be at least 6 characters",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter new password (optional)"
                    id="profile-password" // Add unique ID
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    block
                    size="large"
                    icon={<EditOutlined />}
                  >
                    {saving ? "Updating..." : "Update Profile"}
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>

        {/* Avatar Selection Modal */}
        <Modal
          title="Select Avatar"
          open={avatarModalVisible}
          onCancel={() => setAvatarModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setAvatarModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => setAvatarModalVisible(false)}
            >
              Save
            </Button>,
          ]}
          width={600}
          style={{ color: "white" }}
        >
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "white", marginBottom: 16 }}>
              Choose a preset avatar:
            </h4>
            <Row gutter={[16, 16]}>
              {avatarOptions.map((avatar) => (
                <Col span={6} key={avatar.id}>
                  <div
                    style={{
                      textAlign: "center",
                      cursor: "pointer",
                      padding: 8,
                      borderRadius: 8,
                      border:
                        selectedAvatar === avatar.id
                          ? "2px solid #1890ff"
                          : "2px solid transparent",
                      background:
                        selectedAvatar === avatar.id
                          ? "rgba(24,144,255,0.1)"
                          : "transparent",
                    }}
                    onClick={() => handleAvatarSelect(avatar.id)}
                  >
                    <Avatar
                      size={64}
                      icon={avatar.icon}
                      style={{ backgroundColor: avatar.color }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div>
            <h4 style={{ color: "white", marginBottom: 16 }}>
              Or upload your own:
            </h4>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadChange}
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                Upload Image
              </Button>
            </Upload>
            {uploadedAvatar && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Avatar size={64} src={uploadedAvatar} />
                <p style={{ color: "white", marginTop: 8 }}>Preview</p>
              </div>
            )}
          </div>
        </Modal>

        {profileData && !loading && (
          <Card
            className="glass-card"
            style={{
              width: isMobile ? "100%" : 500,
              maxWidth: "100%",
              marginTop: 24,
            }}
          >
            <Title level={4} style={{ color: "white", marginBottom: 16 }}>
              Account Information
            </Title>
            <div style={{ color: "white" }}>
              <p>
                <strong>Email:</strong> {profileData.email}
              </p>
              <p>
                <strong>Name:</strong> {profileData.name}
              </p>
              <p>
                <strong>Member since:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Profile;
