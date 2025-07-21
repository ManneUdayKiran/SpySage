# 🕵️ SpySage - Intelligent Competitor Monitoring Platform

SpySage is a comprehensive competitor monitoring and analysis platform that helps businesses stay ahead by tracking competitor website changes, analyzing market trends, and providing actionable insights through AI-powered analysis.

## ✨ Features

### 🔍 **Competitor Monitoring**

- **Real-time Website Tracking**: Monitor competitor websites for changes automatically
- **Visual Diff Detection**: Screenshot-based comparison with before/after images
- **Smart Change Analysis**: AI-powered analysis of detected changes using Groq/OpenRouter
- **Automated Scheduling**: Configurable monitoring intervals for continuous surveillance

### 📊 **Analytics & Insights**

- **Timeline View**: Visual timeline of all detected changes
- **Dashboard Analytics**: Comprehensive analytics with charts and metrics
- **Export Functionality**: Export competitor data and changes to CSV
- **Change Categorization**: Automatic categorization of detected changes

### 🔔 **Multi-Channel Notifications**

- **Slack Integration**: Real-time notifications to Slack channels
- **Email Notifications**: Automated email alerts for important changes
- **Notion Sync**: Automatically sync changes to Notion databases
- **Twitter Integration**: Social media buzz tracking and mentions

### 🔒 **Security & User Management**

- **JWT Authentication**: Secure user authentication and authorization
- **Encrypted API Keys**: All API keys are encrypted before storage
- **User Isolation**: Each user sees only their own competitors and data
- **API Key Management**: Secure storage and management of third-party API keys

### 🎨 **Modern UI/UX**

- **React + Ant Design**: Beautiful, responsive user interface
- **Glass Morphism Design**: Modern glass-card styling with animations
- **Dark Theme**: Sleek dark theme optimized for long usage sessions
- **Mobile Responsive**: Works seamlessly across all device types

## 🛠 Tech Stack

### Frontend

- **React 19.1** - Modern React with latest features
- **Vite** - Lightning-fast build tool and dev server
- **Ant Design 5** - Enterprise-grade UI component library
- **React Router DOM** - Client-side routing
- **Chart.js** - Interactive charts and data visualization
- **Axios** - HTTP client for API communication

### Backend

- **Node.js + Express** - Server-side runtime and web framework
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Tokens for authentication
- **Puppeteer** - Headless Chrome for web scraping and screenshots
- **Node-cron** - Task scheduling for automated monitoring

### AI & Integrations

- **Groq AI** - Fast AI inference for change analysis
- **OpenRouter** - Alternative AI service integration
- **Slack API** - Team collaboration notifications
- **Notion API** - Knowledge base synchronization
- **Twitter API** - Social media monitoring
- **Nodemailer** - Email notification system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- API keys for desired integrations (Groq, Slack, Notion, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ManneUdayKiran/SpySage.git
   cd SpySage
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the backend directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/spysage
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000

   # Optional: Default API keys (users can override)
   GROQ_API_KEY=your-groq-api-key
   SLACK_BOT_TOKEN=your-slack-bot-token
   NOTION_API_KEY=your-notion-api-key
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm start
   ```

   This runs both the main server and the scheduler concurrently.

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📖 Usage Guide

### Getting Started

1. **Sign Up**: Create your account on the platform
2. **Configure API Keys**: Go to Settings → API Keys and add your service keys
3. **Add Competitors**: Navigate to Competitors and add websites to monitor
4. **Set Monitoring**: Configure check intervals and notification preferences
5. **View Changes**: Monitor detected changes in the Dashboard and Timeline

### API Key Configuration

SpySage supports multiple integrations:

- **Groq API**: AI-powered change analysis
- **OpenRouter**: Alternative AI service
- **Slack**: Team notifications
- **Notion**: Knowledge base sync
- **Email**: SMTP notifications
- **Twitter**: Social media monitoring

All API keys are encrypted and stored securely per user.

### Competitor Management

- Add unlimited competitor websites
- Set custom check intervals (15min to 24h)
- Configure specific elements to monitor
- Enable/disable competitors as needed

## 🏗 Project Structure

```
SpySage/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API communication layer
│   │   └── App.jsx         # Main application component
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── models/             # MongoDB data models
│   ├── routes/             # Express route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── screenshots/        # Stored comparison screenshots
│   ├── server.js           # Main server file
│   ├── scheduler.js        # Background task scheduler
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Monitoring Settings

- **Check Interval**: Configure how often to check for changes
- **Screenshot Quality**: Adjust screenshot resolution and quality
- **Change Sensitivity**: Set threshold for detecting meaningful changes
- **Notification Rules**: Configure when and how to send notifications

### Notification Channels

All notification channels are configurable per user:

- **Slack**: Bot token and channel ID
- **Email**: SMTP configuration
- **Notion**: API key and database ID
- **Twitter**: Bearer token for API access

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:

- Create an issue on GitHub
- Check our documentation
- Contact the development team

## 🏆 Acknowledgments

- **Ant Design** - For the beautiful UI components
- **Puppeteer** - For reliable web scraping capabilities
- **Groq** - For fast AI inference
- **MongoDB** - For flexible data storage
- **React** - For the amazing frontend framework

---

Built with ❤️ by the SpySage team. Happy monitoring! 🚀
