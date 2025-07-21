import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  MailOutlined,
  SlackOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ClockCircleOutlined as ClockIcon,
  KeyOutlined,
} from "@ant-design/icons";
import {
  getCompetitors,
  getChanges,
  createCompetitor,
  getTrendingCompetitors,
} from "../api";
import { Doughnut, Line as ChartLine, Bar as ChartBar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);
import { saveAs } from "file-saver";
import "../App.css";
function Dashboard() {
  const navigate = useNavigate();
  const [competitorCount, setCompetitorCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [recentChangeCount, setRecentChangeCount] = useState(0);
  const [recentChanges, setRecentChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [manualScrapeLoading, setManualScrapeLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    mongo: true,
    notion: true,
    slack: true,
    email: true,
    scheduler: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    channels: [],
    frequency: "",
  });
  const [addForm] = Form.useForm();
  const [competitors, setCompetitors] = useState([]);
  const [changes, setChanges] = useState([]);
  const [trendingCompetitors, setTrendingCompetitors] = useState([]);
  const [serviceAvailability, setServiceAvailability] = useState({});

  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      // Using absolute URL with the correct port
      const res = await fetch(
        "http://localhost:5000/api/user/notification-settings",
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
      setNotificationSettings(data);
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
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
      setServiceAvailability(data.services || {});
    } catch (err) {
      console.error("Failed to fetch service availability:", err);
      // Set default empty object
      setServiceAvailability({});
    }
  };
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const competitors = await getCompetitors();
        setCompetitors(competitors);
        setCompetitorCount(competitors.length);
        const changes = await getChanges();
        setChanges(changes); // <-- add this line
        setChangeCount(changes.length);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        setRecentChangeCount(
          changes.filter((c) => new Date(c.detectedAt) >= oneWeekAgo).length
        );
        setRecentChanges(
          changes
            .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
            .slice(0, 5)
        );
        // Bar chart data: changes per competitor in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const changesLast30 = changes.filter(
          (c) => new Date(c.detectedAt) >= thirtyDaysAgo
        );
        const counts = {};
        changesLast30.forEach((c) => {
          const name = c.competitor?.name || "Unknown";
          counts[name] = (counts[name] || 0) + 1;
        });
        setBarData(
          Object.entries(counts).map(([name, value]) => ({ name, value }))
        );
      } catch (err) {
        message.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    fetchNotificationSettings();
    fetchServiceAvailability();
    // Fetch trending competitors
    getTrendingCompetitors()
      .then(setTrendingCompetitors)
      .catch(() => {});
    // Fetch system health from backend
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setSystemHealth(data))
      .catch(() => {});
  }, []);

  // Quick Action Handlers
  const handleAddCompetitor = () => setQuickActionModal(true);
  const handleAddCompetitorOk = async () => {
    try {
      // Validate and get form values
      const values = await addForm.validateFields();
      console.log("Form values:", values);

      // Prepare payload with tags always as an array
      const payload = {
        ...values,
        tags: Array.isArray(values.tags) ? values.tags : [],
      };

      // Submit to backend
      await createCompetitor(payload);

      // Clean up and notify
      setQuickActionModal(false);
      addForm.resetFields();
      message.success("Competitor added successfully!");

      // Refresh data
      const competitors = await getCompetitors();
      setCompetitors(competitors);
      setCompetitorCount(competitors.length);
    } catch (err) {
      console.error("Add competitor error:", err);
      message.error(err.message || "Failed to add competitor");
    }
  };
  const handleAddCompetitorCancel = () => {
    setQuickActionModal(false);
    addForm.resetFields();
  };
  const handleManualScrape = async () => {
    setManualScrapeLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/health/manual-scrape",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        message.success("Manual scrape triggered!");
      } else {
        message.error(data.message || "Failed to trigger manual scrape");
      }
    } catch (err) {
      message.error("Failed to trigger manual scrape");
    } finally {
      setManualScrapeLoading(false);
    }
  };
  const handleExportCSV = () => {
    // Export all changes as CSV
    const headers = [
      "Competitor",
      "Summary",
      "Type",
      "Detected At",
      "Impact",
      "Tags",
      "URL",
    ];
    const rows = recentChanges.map((c) => [
      c.competitor?.name || "",
      c.summary || "",
      c.type || "",
      c.detectedAt ? new Date(c.detectedAt).toLocaleString() : "",
      c.impact || "",
      (c.tags || []).join(","),
      c.url || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((r) =>
        r.map((x) => '"' + (x || "").replace(/"/g, '""') + '"').join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "changes_export.csv");
  };

  // Prepare data for charts
  // 1. Donut chart: competitors by tag (or by name if tags not available)
  const competitorTagCounts = {};
  (Array.isArray(competitors) ? competitors : []).forEach((c) => {
    if (c.tags && c.tags.length) {
      c.tags.forEach((tag) => {
        competitorTagCounts[tag] = (competitorTagCounts[tag] || 0) + 1;
      });
    } else {
      competitorTagCounts["Untagged"] =
        (competitorTagCounts["Untagged"] || 0) + 1;
    }
  });
  const donutLabels = Object.keys(competitorTagCounts);
  const donutCounts = Object.values(competitorTagCounts);
  const donutColors = [
    "#1677ff",
    "#36a2eb",
    "#ff6384",
    "#ffcd56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#c9cbcf",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
  ];
  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutCounts,
        backgroundColor: donutColors,
        borderWidth: 1,
      },
    ],
  };
  const donutOptions = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "Unknown";
            console.log("Donut chart hover tag:", label);
            return `${label}: ${context.parsed}`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // 2. Line chart: changes trend over last 30 days
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const changesByDay = {};
  (Array.isArray(changes) ? changes : []).forEach((c) => {
    const day = c.detectedAt
      ? new Date(c.detectedAt).toISOString().slice(0, 10)
      : null;
    if (day && last30Days.includes(day)) {
      changesByDay[day] = (changesByDay[day] || 0) + 1;
    }
  });
  const lineData = {
    labels: last30Days,
    datasets: [
      {
        label: "Changes",
        data: last30Days.map((day) => changesByDay[day] || 0),
        fill: false,
        borderColor: "#1677ff",
        backgroundColor: "#1677ff",
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };
  const lineOptions = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 },
    },
  };

  // 3. Bar chart: changes per day for last 7 days
  const last7Days = last30Days.slice(-7);
  const barChartData = {
    labels: last7Days,
    datasets: [
      {
        label: "Changes",
        data: last7Days.map((day) => changesByDay[day] || 0),
        backgroundColor: "#1677ff",
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };
  const barOptions = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 },
    },
  };

  const categoryColors = {
    UI: "blue",
    pricing: "volcano",
    feature: "green",
    performance: "purple",
    other: "default",
  };

  return (
    <div className="fade-in" style={{ color: "white" }}>
      {/* Quick Actions Sub-Navigation */}
      <div
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 998,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "12px 24px",
        }}
      >
        <Row gutter={[16, 16]} justify="center">
          <Col xs={12} sm={6} md={3}>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              block
              onClick={handleAddCompetitor}
              size="small"
              style={{ fontSize: "12px" }}
            >
              Add Competitor
            </Button>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              icon={<ReloadOutlined />}
              block
              loading={manualScrapeLoading}
              onClick={handleManualScrape}
              size="small"
              style={{ fontSize: "12px" }}
            >
              Manual Scrape
            </Button>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              icon={<DownloadOutlined />}
              block
              onClick={handleExportCSV}
              size="small"
              style={{ fontSize: "12px" }}
            >
              Export Changes
            </Button>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              icon={<KeyOutlined />}
              block
              onClick={() => navigate("/api-keys")}
              size="small"
              type="default"
              style={{ fontSize: "12px" }}
            >
              API Keys
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: "60px" }}>
        <div>
          <h2 style={{ textAlign: "center" }}>Dashboard</h2>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="glass-card">
              <Statistic
                title={<span style={{ color: "white" }}>Competitor</span>}
                value={competitorCount}
                prefix={<TeamOutlined />}
                loading={loading}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <div className="chart-fade-in">
                  <Doughnut
                    data={donutData}
                    options={donutOptions}
                    width={120}
                    height={120}
                  />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="glass-card">
              <Statistic
                title={
                  <span style={{ color: "white" }}>Total Changes Detected</span>
                }
                value={changeCount}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <div className="chart-fade-in">
                  <ChartLine
                    data={lineData}
                    options={lineOptions}
                    width={140}
                    height={120}
                  />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="glass-card">
              <Statistic
                title={
                  <span style={{ color: "white" }}>Changes (Last 7 days)</span>
                }
                value={recentChangeCount}
                prefix={<ClockCircleOutlined color="white" />}
                loading={loading}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <div className="chart-fade-in">
                  <ChartBar
                    data={barChartData}
                    options={barOptions}
                    width={140}
                    height={120}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content with top margin to account for sub-nav */}
      <div style={{ marginTop: "60px" }}>
        {/* Trending Competitor Changes Panel */}
        <Card
          className="glass-car"
          style={{
            marginBottom: 32,
            background: "transparent",
            border: "none",
          }}
        >
          <Typography.Title
            level={4}
            style={{
              marginBottom: 16,
              fontSize: 18,
              color: "white",
              textAlign: "center",
            }}
          >
            Trending Competitor Changes
          </Typography.Title>
          <Row style={{ color: "white" }} gutter={[16, 16]}>
            {trendingCompetitors.length === 0 ? (
              <Col span={24}>
                <Typography.Text style={{ color: "white" }}>
                  No trending competitors found.
                </Typography.Text>
              </Col>
            ) : (
              trendingCompetitors.map((comp) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  key={comp._id}
                  style={{ color: "white", display: "flex" }}
                >
                  <Card
                    title={comp.name}
                    bordered={true}
                    className="glass-card"
                    style={{
                      color: "white",
                      width: "100%",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    bodyStyle={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p style={{ color: "white" }}>
                        <b>Website:</b>{" "}
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "white",
                            textDecoration: "underline",
                          }}
                        >
                          {comp.website}
                        </a>
                      </p>
                      <p style={{ color: "white" }}>
                        <b>Buzz (mentions):</b>{" "}
                        <Tag color="magenta">{comp.buzz}</Tag>
                      </p>
                    </div>
                    {comp.tags && comp.tags.length > 0 && (
                      <div style={{ marginTop: "auto", paddingTop: 12 }}>
                        <p style={{ color: "white", marginBottom: 0 }}>
                          <b>Tags:</b>{" "}
                          {comp.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </p>
                      </div>
                    )}
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Card>
        {/* Service Configuration Status */}
        <Card className="glass-card" style={{ marginBottom: 32 }}>
          <Typography.Title
            level={4}
            style={{
              marginBottom: 16,
              fontSize: 18,
              color: "white",
              textAlign: "center",
            }}
          >
            Service Configuration Status
          </Typography.Title>
          <Row gutter={[16, 16]}>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.groq ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>Groq AI</div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.notion ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>Notion</div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.slack ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>Slack</div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.email ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>Email</div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.twitter ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>Twitter</div>
              </div>
            </Col>
            <Col
              xs={12}
              sm={8}
              md={4}
              style={{ color: "white", textAlign: "center" }}
            >
              <div>
                {serviceAvailability.openRouter ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleTwoTone
                    twoToneColor="#ff4d4f"
                    style={{ fontSize: 20 }}
                  />
                )}
                <div style={{ marginTop: 4 }}>OpenRouter</div>
              </div>
            </Col>
          </Row>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button
              type="link"
              onClick={() => navigate("/api-keys")}
              style={{ color: "white", textDecoration: "underline" }}
            >
              Configure API Keys →
            </Button>
          </div>
        </Card>

        <Modal
          title="Add Competitor"
          open={quickActionModal}
          onOk={handleAddCompetitorOk}
          onCancel={handleAddCompetitorCancel}
          okText="Add"
          cancelText="Cancel"
          width={400}
        >
          <Form form={addForm} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter a name" }]}
            >
              <Input placeholder="Enter competitor name" />
            </Form.Item>
            <Form.Item
              name="website"
              label="Website"
              rules={[
                { required: true, message: "Please enter a website" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Form.Item
              name="changelogUrl"
              label="Changelog URL"
              rules={[{ type: "url", message: "Please enter a valid URL" }]}
            >
              <Input placeholder="https://example.com/changelog" />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Enter tags"
              />
            </Form.Item>
          </Form>
        </Modal>
        {/* System Health */}
        <Card
          className="glass-card"
          style={{ marginBottom: 32, marginTop: 24 }}
        >
          <Typography.Title
            level={4}
            style={{ marginBottom: 16, fontSize: 18, color: "white" }}
          >
            System Health
          </Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4} style={{ color: "white" }}>
              <DatabaseOutlined style={{ color: "white" }} /> MongoDB{" "}
              {systemHealth.mongo ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )}
            </Col>
            <Col xs={12} sm={8} md={4} style={{ color: "white" }}>
              <CloudOutlined style={{ color: "white" }} /> Notion{" "}
              {systemHealth.notion ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )}
            </Col>
            <Col xs={12} sm={8} md={4} style={{ color: "white" }}>
              <SlackOutlined style={{ color: "white" }} /> Slack{" "}
              {systemHealth.slack ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )}
            </Col>
            <Col xs={12} sm={8} md={4} style={{ color: "white" }}>
              <MailOutlined style={{ color: "white" }} /> Email{" "}
              {systemHealth.email ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )}
            </Col>
            <Col xs={12} sm={8} md={4} style={{ color: "white" }}>
              <ClockIcon style={{ color: "white" }} /> Scheduler{" "}
              {systemHealth.scheduler ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )}
            </Col>
          </Row>
        </Card>
        {/* Notification Overview */}
        <Card className="glass-card" style={{ marginBottom: 32 }}>
          <Typography.Title
            level={4}
            style={{ marginBottom: 16, fontSize: 18, color: "white" }}
          >
            Notification Overview
          </Typography.Title>
          <Form
            layout="inline"
            initialValues={notificationSettings}
            onFinish={async (values) => {
              const token = localStorage.getItem("token");

              try {
                await fetch(
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
                message.success("Notification settings updated!");
                fetchNotificationSettings();
              } catch (err) {
                message.error("Failed to update notification settings");
                console.error(err);
              }
            }}
            style={{ marginBottom: 0 }}
          >
            <Form.Item name="channels" label="Channels">
              <Select
                mode="multiple"
                style={{ minWidth: 180 }}
                options={[
                  { label: "Slack", value: "slack" },
                  { label: "Notion", value: "notion" },
                  { label: "Email", value: "email" },
                ]}
              />
            </Form.Item>
            <Form.Item name="frequency" label="Frequency">
              <Select
                style={{ minWidth: 120 }}
                options={[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div style={{ marginTop: 40 }}>
          <Typography.Title
            level={4}
            style={{ marginBottom: 16, color: "white" }}
          >
            Recent Activity
          </Typography.Title>
          {recentChanges.length === 0 ? (
            <Typography.Text type="secondary">
              No recent changes.
            </Typography.Text>
          ) : (
            <Row gutter={[16, 16]}>
              {recentChanges.map((change, idx) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  key={change._id || idx}
                  style={{ color: "white", display: "flex" }}
                >
                  <Card
                    className="glass-card"
                    style={{
                      color: "white",
                      width: "100%",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    bodyStyle={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Typography.Text
                        style={{ color: "white", fontWeight: "bold" }}
                      >
                        {change.competitor?.name || "Unknown Competitor"}
                      </Typography.Text>
                      <Typography.Paragraph
                        style={{ color: "white", marginTop: 8 }}
                      >
                        {change.summary}
                      </Typography.Paragraph>
                      <Typography.Text style={{ color: "white" }}>
                        {change.type}
                      </Typography.Text>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 12 }}>
                      <Typography.Text
                        style={{ color: "white", fontSize: "12px" }}
                      >
                        {change.detectedAt
                          ? new Date(change.detectedAt).toLocaleString()
                          : ""}
                      </Typography.Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
