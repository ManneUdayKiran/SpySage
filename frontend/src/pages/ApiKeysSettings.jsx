import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
  Alert,
  Space,
  Tooltip,
} from "antd";
import {
  KeyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "../App.css";

const { Title, Text } = Typography;

function ApiKeysSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [editingFields, setEditingFields] = useState({});

  // Configure message position
  useEffect(() => {
    message.config({
      top: 60,
      duration: 4,
      maxCount: 3,
    });
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/api-keys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched API keys:", data); // Debug log
      setApiKeys(data);

      // The backend already returns masked values, so use them directly
      form.setFieldsValue(data);
    } catch (err) {
      console.error("Failed to load API keys:", err);
      message.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Filter out empty values and masked values (backend sends masked values starting with *)
      const keysToSave = {};
      Object.keys(values).forEach((key) => {
        if (
          values[key] &&
          !values[key].startsWith("*") &&
          !values[key].startsWith("•")
        ) {
          keysToSave[key] = values[key];
        }
      });

      console.log("Saving keys:", Object.keys(keysToSave)); // Debug log

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(keysToSave),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success(
          "API Keys Saved Successfully! Your keys have been encrypted and stored securely."
        );

        setEditingFields({});
        await fetchApiKeys(); // Refresh to get updated data
      } else {
        message.error(data.message || "Failed to save API keys");
      }
    } catch (err) {
      console.error("Failed to save API keys:", err);
      message.error("Failed to save API keys");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fieldName) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    form.setFieldValue(fieldName, "");
  };

  const handleCancel = (fieldName) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
    // Reset to the original masked value from apiKeys
    form.setFieldValue(fieldName, apiKeys[fieldName] || "");
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/api-keys", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success("All API keys deleted successfully!");
        form.resetFields();
        setApiKeys({});
      } else {
        message.error(data.message || "Failed to delete API keys");
      }
    } catch (err) {
      console.error("Failed to delete API keys:", err);
      message.error("Failed to delete API keys");
    }
  };

  return (
    <div
      className="fade-in"
      style={{ color: "white", maxWidth: 800, margin: "0 auto" }}
    >
      <Title
        level={2}
        style={{ color: "white", textAlign: "center", marginBottom: 32 }}
      >
        <KeyOutlined /> API Keys Settings
      </Title>

      <Alert
        message="Secure API Key Management"
        description="Your API keys are encrypted and stored securely. Enter your own keys to use the various services and agents."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card className="glass-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={apiKeys}
        >
          {/* AI/LLM Services */}
          <Title level={4} style={{ color: "white" }}>
            AI/LLM Services
          </Title>
          <Form.Item
            name="groqApiKey"
            label={<span style={{ color: "white" }}>Groq API Key</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Get your free API key from{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Groq Console
                </a>
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="gsk_..."
                readOnly={apiKeys.groqApiKey && !editingFields.groqApiKey}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="Used for AI-powered change analysis and summaries">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.groqApiKey && !editingFields.groqApiKey && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("groqApiKey")}
                >
                  Edit
                </Button>
              )}
              {editingFields.groqApiKey && (
                <Button onClick={() => handleCancel("groqApiKey")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="openRouterApiKey"
            label={<span style={{ color: "white" }}>OpenRouter API Key</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Get your API key from{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenRouter
                </a>
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="sk-or-v1-..."
                readOnly={
                  apiKeys.openRouterApiKey && !editingFields.openRouterApiKey
                }
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="Alternative AI service for enhanced analysis">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.openRouterApiKey && !editingFields.openRouterApiKey && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("openRouterApiKey")}
                >
                  Edit
                </Button>
              )}
              {editingFields.openRouterApiKey && (
                <Button onClick={() => handleCancel("openRouterApiKey")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Divider />

          {/* Notion Integration */}
          <Title level={4} style={{ color: "white" }}>
            Notion Integration
          </Title>
          <Form.Item
            name="notionApiKey"
            label={<span style={{ color: "white" }}>Notion API Key</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Create an integration at{" "}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Notion Integrations
                </a>
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="ntn_..."
                readOnly={apiKeys.notionApiKey && !editingFields.notionApiKey}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="Used to sync competitor changes to your Notion database">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.notionApiKey && !editingFields.notionApiKey && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("notionApiKey")}
                >
                  Edit
                </Button>
              )}
              {editingFields.notionApiKey && (
                <Button onClick={() => handleCancel("notionApiKey")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="notionDatabaseId"
            label={<span style={{ color: "white" }}>Notion Database ID</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Copy the database ID from your Notion database URL
              </Text>
            }
          >
            <Input.Group compact>
              <Input
                placeholder="32-character database ID"
                readOnly={
                  apiKeys.notionDatabaseId && !editingFields.notionDatabaseId
                }
                suffix={
                  <Tooltip title="The ID of the Notion database where changes will be stored">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.notionDatabaseId && !editingFields.notionDatabaseId && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("notionDatabaseId")}
                >
                  Edit
                </Button>
              )}
              {editingFields.notionDatabaseId && (
                <Button onClick={() => handleCancel("notionDatabaseId")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Divider />

          {/* Slack Integration */}
          <Title level={4} style={{ color: "white" }}>
            Slack Integration
          </Title>
          <Form.Item
            name="slackBotToken"
            label={<span style={{ color: "white" }}>Slack Bot Token</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Create a Slack app and bot at{" "}
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Slack API
                </a>
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="xoxb-..."
                readOnly={apiKeys.slackBotToken && !editingFields.slackBotToken}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="Bot token for sending notifications to Slack">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.slackBotToken && !editingFields.slackBotToken && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("slackBotToken")}
                >
                  Edit
                </Button>
              )}
              {editingFields.slackBotToken && (
                <Button onClick={() => handleCancel("slackBotToken")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="slackChannelId"
            label={<span style={{ color: "white" }}>Slack Channel ID</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Right-click on your Slack channel and copy the channel ID
              </Text>
            }
          >
            <Input.Group compact>
              <Input
                placeholder="C1234567890"
                readOnly={
                  apiKeys.slackChannelId && !editingFields.slackChannelId
                }
                suffix={
                  <Tooltip title="The channel where notifications will be sent">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.slackChannelId && !editingFields.slackChannelId && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("slackChannelId")}
                >
                  Edit
                </Button>
              )}
              {editingFields.slackChannelId && (
                <Button onClick={() => handleCancel("slackChannelId")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Divider />

          {/* Email Configuration */}
          <Title level={4} style={{ color: "white" }}>
            Email Notifications
          </Title>
          <Form.Item
            name="emailUser"
            label={<span style={{ color: "white" }}>Email Address</span>}
          >
            <Input.Group compact>
              <Input
                type="email"
                placeholder="your-email@gmail.com"
                readOnly={apiKeys.emailUser && !editingFields.emailUser}
                suffix={
                  <Tooltip title="Email address for sending notifications">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.emailUser && !editingFields.emailUser && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("emailUser")}
                >
                  Edit
                </Button>
              )}
              {editingFields.emailUser && (
                <Button onClick={() => handleCancel("emailUser")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="emailPass"
            label={<span style={{ color: "white" }}>App Password</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Use App Password for Gmail. Generate one in your Google Account
                security settings.
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="16-character app password"
                readOnly={apiKeys.emailPass && !editingFields.emailPass}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="App password for email authentication">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.emailPass && !editingFields.emailPass && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit("emailPass")}
                >
                  Edit
                </Button>
              )}
              {editingFields.emailPass && (
                <Button onClick={() => handleCancel("emailPass")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <Divider />

          {/* Twitter/Social */}
          <Title level={4} style={{ color: "white" }}>
            Social Media Integration
          </Title>
          <Form.Item
            name="twitterBearerToken"
            label={<span style={{ color: "white" }}>Twitter Bearer Token</span>}
            extra={
              <Text
                type="secondary"
                style={{ fontSize: "12px", color: "white" }}
              >
                Get your bearer token from{" "}
                <a
                  href="https://developer.twitter.com/en/portal/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter Developer Portal
                </a>
              </Text>
            }
          >
            <Input.Group compact>
              <Input.Password
                placeholder="AAAA..."
                readOnly={
                  apiKeys.twitterBearerToken &&
                  !editingFields.twitterBearerToken
                }
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                suffix={
                  <Tooltip title="Used for tracking social media buzz and mentions">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
                style={{ flex: 1 }}
              />
              {apiKeys.twitterBearerToken &&
                !editingFields.twitterBearerToken && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit("twitterBearerToken")}
                  >
                    Edit
                  </Button>
                )}
              {editingFields.twitterBearerToken && (
                <Button onClick={() => handleCancel("twitterBearerToken")}>
                  Cancel
                </Button>
              )}
            </Input.Group>
          </Form.Item>

          <div style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
                icon={<KeyOutlined />}
              >
                Save API Keys
              </Button>
              <Button danger onClick={handleDelete} size="large">
                Delete All Keys
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card className="glass-card" style={{ marginTop: 24 }}>
        <Title level={4} style={{ color: "white" }}>
          Security Notice
        </Title>
        <Text style={{ color: "white" }}>
          • All API keys are encrypted before storage
          <br />
          • Keys are only decrypted when needed for API calls
          <br />
          • You can delete your keys at any time
          <br />
          • Keys are tied to your account and not shared
          <br />• Without your keys, certain features will be disabled
        </Text>
      </Card>
    </div>
  );
}

export default ApiKeysSettings;
