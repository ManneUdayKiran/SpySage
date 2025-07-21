import React, { useEffect, useState } from "react";
import {
  Typography,
  Form,
  Checkbox,
  Select,
  Button,
  message,
  Card,
  Modal,
  Alert,
} from "antd";
import { useNavigate } from "react-router-dom";

message.config({
  top: 80, // distance from top in pixels
  duration: 2, // seconds (optional)
});

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

const channelOptions = [
  { label: "Slack", value: "slack" },
  { label: "Notion", value: "notion" },
  { label: "Email", value: "email" },
];

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

// Map notification channels to required API keys
const channelRequirements = {
  slack: ["slackBotToken", "slackChannelId"],
  notion: ["notionApiKey", "notionDatabaseId"],
  email: ["emailUser", "emailPass"],
};

function NotificationSettings() {
  const [form] = Form.useForm();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [serviceAvailability, setServiceAvailability] = useState({
    slack: false,
    notion: false,
    email: false,
  });
  const [missingKeysModal, setMissingKeysModal] = useState({
    visible: false,
    service: null,
  });

  useEffect(() => {
    fetchNotificationSettings();
    fetchServiceAvailability();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      // First try to fetch from backend
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "http://localhost:5000/api/user/notification-settings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          form.setFieldsValue(data);
          return;
        }
      } catch (backendErr) {
        console.error("Error fetching from backend:", backendErr);
      }

      // Fallback to localStorage if backend fetch fails
      const saved = localStorage.getItem("notificationSettings");
      if (saved) {
        form.setFieldsValue(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    }
  };

  const fetchServiceAvailability = async () => {
    try {
      const token = localStorage.getItem("token");

      // Using absolute URL with the correct port
      const res = await fetch(
        "http://localhost:5000/api/api-keys/availability",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = await res.json();

      // Update service availability based on API keys
      setServiceAvailability({
        slack: data.services?.slack || false,
        notion: data.services?.notion || false,
        email: data.services?.email || false,
      });
    } catch (err) {
      console.error("Failed to fetch service availability:", err);
      // Set all services to unavailable on error
      setServiceAvailability({
        slack: false,
        notion: false,
        email: false,
      });
    }
  };

  const handleChannelChange = (values) => {
    // Check if any selected channel doesn't have the required API keys
    values.forEach((channel) => {
      if (!serviceAvailability[channel]) {
        // Show the modal for the first missing service found
        setMissingKeysModal({
          visible: true,
          service: channel,
        });
      }
    });
  };

  const redirectToApiSettings = () => {
    setMissingKeysModal({ visible: false, service: null });
    navigate("/api-keys");
  };

  const onFinish = async (values) => {
    try {
      // Check if all selected channels have the required API keys
      const missingServices = values.channels.filter(
        (channel) => !serviceAvailability[channel]
      );

      if (missingServices.length > 0) {
        // Show modal for the first missing service
        setMissingKeysModal({
          visible: true,
          service: missingServices[0],
        });
        return;
      }

      // Save to both backend and localStorage for resilience
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "http://localhost:5000/api/user/notification-settings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
          }
        );

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        // Also save to localStorage as backup
        localStorage.setItem("notificationSettings", JSON.stringify(values));
        message.success("Notification settings saved!");
      } catch (backendErr) {
        console.error("Error saving to backend:", backendErr);
        // Fallback to just localStorage
        localStorage.setItem("notificationSettings", JSON.stringify(values));
        message.warning(
          "Saved locally, but couldn't connect to server. Settings may not persist across devices."
        );
      }
    } catch (error) {
      message.error("Failed to save notification settings. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="fade-in" style={{ color: "white", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: isMobile ? 16 : 24,
        }}
      >
        <Card
          className="glass-card"
          style={{
            width: isMobile ? "100%" : 500,
            maxWidth: isMobile ? "100%" : 500,
          }}
        >
          <Typography.Title
            level={2}
            style={{ marginBottom: 24, color: "white" }}
          >
            Notification Settings
          </Typography.Title>

          {Object.entries(serviceAvailability).some(
            ([_, available]) => !available
          ) && (
            <Alert
              message="Some notification services require API keys"
              description="To enable all notification channels, please configure your API keys in the API Keys settings."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={() => navigate("/api-keys")}
                >
                  Configure Keys
                </Button>
              }
            />
          )}

          <Form className="" form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="channels"
              label={
                <span style={{ color: "white" }}>Notification Channels</span>
              }
              rules={[
                { required: true, message: "Select at least one channel" },
              ]}
            >
              <Checkbox.Group
                options={channelOptions.map((option) => ({
                  ...option,
                  disabled: !serviceAvailability[option.value],
                }))}
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 8 : 16,
                  color: "white",
                }}
                onChange={handleChannelChange}
              />
            </Form.Item>
            <Form.Item
              name="frequency"
              label={
                <span style={{ color: "white" }}>Notification Frequency</span>
              }
              rules={[{ required: true, message: "Select a frequency" }]}
            >
              <Select
                options={frequencyOptions}
                style={{ width: isMobile ? "100%" : 200 }}
                size={isMobile ? "large" : "middle"}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size={isMobile ? "large" : "middle"}
                block={isMobile}
              >
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Modal for missing API keys */}
      <Modal
        title="API Keys Required"
        open={missingKeysModal.visible}
        onOk={redirectToApiSettings}
        onCancel={() => setMissingKeysModal({ visible: false, service: null })}
        okText="Configure API Keys"
        cancelText="Cancel"
      >
        <p>
          {missingKeysModal.service === "slack" && (
            <>
              To enable Slack notifications, you need to configure your Slack
              Bot Token and Channel ID.
            </>
          )}
          {missingKeysModal.service === "notion" && (
            <>
              To enable Notion integration, you need to configure your Notion
              API Key and Database ID.
            </>
          )}
          {missingKeysModal.service === "email" && (
            <>
              To enable Email notifications, you need to configure your Email
              credentials.
            </>
          )}
        </p>
        <p>Would you like to configure these keys now?</p>
      </Modal>
    </div>
  );
}

export default NotificationSettings;
