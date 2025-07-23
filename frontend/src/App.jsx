import * as React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Drawer,
  Avatar,
  Dropdown,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  EditOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import Dashboard from "./pages/Dashboard";
import Competitors from "./pages/Competitors";
import Changes from "./pages/Changes";
import NotificationSettings from "./pages/NotificationSettings";
import ApiKeysSettings from "./pages/ApiKeysSettings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import TimelinePage from "./pages/Timeline";
import { AuthProvider, useAuth } from "./AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppLayout() {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
    editForm.setFieldsValue({
      name: user?.name || "",
      email: user?.email || "",
    });
  };

  const handleSaveProfile = async (values) => {
    setProfileLoading(true);
    try {
      message.success("Profile updated successfully!");
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit Profile",
      onClick: handleEditProfile,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const navItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/competitors", icon: <TeamOutlined />, label: "Competitors" },
    { key: "/changes", icon: <FileTextOutlined />, label: "Changes" },
    { key: "/timeline", icon: <FileTextOutlined />, label: "Timeline" },
    { key: "/api-keys", icon: <KeyOutlined />, label: "API Keys" },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Notification Settings",
    },
  ];

  const handleNavClick = (e) => {
    navigate(e.key);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Top Navigation Bar */}
      <div
        className="glass-card"
        style={{
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: 64,
          minHeight: 64,
          position: "fixed",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 999,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
          }}
        >
          <Title
            level={4}
            style={{ margin: 0, fontSize: isMobile ? 16 : 20, color: "white" }}
          >
            SpySage
          </Title>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={handleNavClick}
            items={navItems.map((item) => ({
              ...item,
              label: <span style={{ color: "white" }}>{item.label}</span>,
            }))}
            style={{
              background: "transparent",
              borderBottom: "none",
              color: "white",
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
            }}
          />
        </div>
        {isAuthenticated && (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["hover"]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginRight: "18px",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "background-color 0.2s",
                color: "white",
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ marginRight: 8 }}
              />
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {loading
                  ? "Loading..."
                  : user?.name || user?.username || "User"}
              </span>
            </div>
          </Dropdown>
        )}
      </div>
      <div
        style={{
          flex: 1,
          padding: isMobile ? 16 : 24,
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          marginTop: "64px",
          height: "calc(100vh - 64px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitors"
              element={
                <PrivateRoute>
                  <Competitors />
                </PrivateRoute>
              }
            />
            <Route
              path="/changes"
              element={
                <PrivateRoute>
                  <Changes />
                </PrivateRoute>
              }
            />
            <Route
              path="/timeline"
              element={
                <PrivateRoute>
                  <TimelinePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/api-keys"
              element={
                <PrivateRoute>
                  <ApiKeysSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <NotificationSettings />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input size="large" disabled />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={profileLoading}
              size="large"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        id="bg-video"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          minWidth: "100vw",
          minHeight: "100vh",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <source src="/bg_vid.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
