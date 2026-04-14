# Energy Dashboard - Chat Setup

## 🚀 Quick Start

Both servers are now running:
- **App**: http://localhost:8080/
- **Chat Server**: http://localhost:54321/functions/v1/chat

## 💬 Chat Features

The chatbot now works with these responses:

- **"How can I reduce my energy bill?"** → Tips for saving money
- **"Why is my peak usage so high?"** → Explanation of peak hours
- **"How much CO₂ am I saving?"** → Environmental impact info
- **Any other question** → General energy assistant introduction

## 🛠️ Development

To restart servers:

```bash
# Terminal 1: Chat server
npm run chat-server

# Terminal 2: App server
npm run dev
```

## 📝 Notes

- The chat server simulates Supabase Edge Functions
- Responses are streamed like real AI chat
- No external API keys required
- Works offline once servers are running