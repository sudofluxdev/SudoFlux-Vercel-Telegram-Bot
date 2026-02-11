# 🛰️ BotFlux V1.5 - Omnichannel Matrix System

BotFlux is a professional-grade infrastructure for high-performance Telegram automation.

## 🚀 Elite Features
- **Omnichannel Hub**: Centralized management for Channels (Telegram and WhatsApp UI).
- **Neural Analytics**: Real-time flux stats and uptime monitoring.
- **Advanced CRM**: Lead capture with full interaction history.
- **Keyword Intelligence**: Triggers by Keyword, Regex, and Exact Match.
- **Smart Broadcast**: Scheduled messaging with scope-based targeting.

## 🛠️ Step-by-Step Installation

### 1. Requirements
- [Node.js](https://nodejs.org/) (Version 18+)
- [Firebase](https://console.firebase.com/) account
- [Vercel](https://vercel.com/) account

### 2. Firebase Setup
1. Create a Firebase project.
2. Enable **Firestore Database** and **Authentication** (Google).
3. In "Service Accounts", generate a new private key (JSON).

### 3. Variable Configuration
Rename the `.env.example` file to `.env` and fill it in:
```env
TELEGRAM_BOT_TOKEN="YOUR_TOKEN"
FIREBASE_SERVICE_ACCOUNT_KEY="FIREBASE_JSON"
X-Telegram-Bot-Api-Secret-Token="YOUR_WEBHOOK_SECRET"
```

### 4. Deploy & Webhook
1. Deploy to Vercel.
2. Access `/dashboard/settings` on your domain.
3. Click **"Update Webhook"** to sync your bot.

### 5. Cron Job (Scheduling)
For scheduled broadcasts, configure a Cron Job (e.g., cron-job.org) pointing to `https://your-app.vercel.app/api/cron` every 1 minute.

---

## 🌎 International Market
For documentation in Portuguese, please access [README.md](README.md).
