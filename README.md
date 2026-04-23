# Energy Wise Dashboard

A comprehensive energy monitoring dashboard with AI-powered chat assistance, real-time analytics, and smart energy insights.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation & Setup

```sh
# Step 1: Clone the repository
git clone https://github.com/deekshhh37/energy-wise-dashboard.git

# Step 2: Navigate to the project directory
cd energy-wise-dashboard

# Step 3: Install dependencies
npm install

# Step 4: Start the chat server (Terminal 1)
npm run chat-server

# Step 5: Start the development server (Terminal 2)
npm run dev
```

### Access the Application
- **Dashboard**: http://localhost:8080/
- **Chat Server**: http://localhost:54321/functions/v1/chat

## 💬 Chat Features

The AI-powered chatbot provides intelligent responses about:
- Energy bill reduction tips
- Peak usage analysis
- CO₂ savings information
- General energy consumption insights

Try asking:
- "How can I reduce my energy bill?"
- "Why is my peak usage so high?"
- "How much CO₂ am I saving?"

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run chat-server` - Start mock chat server
- `npm run build` - Build for production
- `npm run test` - Run tests

### Project Structure
```
energy-wise-dashboard/
├── src/
│   ├── components/
│   │   ├── chat/          # Chatbot components
│   │   └── dashboard/     # Dashboard visualizations
│   ├── pages/             # Main application pages
│   ├── lib/               # Utilities and data processing
│   └── contexts/          # React contexts
├── supabase/
│   └── functions/         # Edge functions
├── mock-chat-server.js    # Local chat server
└── CHAT_README.md         # Detailed chat setup
```

## 📊 Features

- **Real-time Analytics**: Monthly consumption charts and insights
- **AI Chat Assistant**: Intelligent energy advice and tips
- **CSV Data Processing**: Real electricity usage data analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI components
- **Charts**: Recharts
- **Backend**: Supabase Edge Functions
- **Development**: Mock chat server for local testing
