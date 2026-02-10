# 🛰️ BotSudo V1.0 - Hyper-Core Telegram System

BotSudo is a complete solution for Telegram channel and group automation, featuring a premium administrative Dashboard.

## 🚀 Key Features
- **Minimalist Dashboard**: Full management through an ultra-fast web interface.
- **Smart Broadcast**: Scheduled message and media delivery with custom intervals.
- **Intelligent Automation**: Automatic replies based on triggers with inline button support.
- **Lead Management**: Automatically capture users who interact with the bot.
- **Authorization System**: Full control over which groups the bot can operate in.

## 🛠️ Step-by-Step Installation

### 1. Requirements
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- A [Firebase](https://console.firebase.google.com/) account
- A [Vercel](https://vercel.com/) account (Optional, for hosting)
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### 2. Firebase Setup
1. Create a Firebase project.
2. Enable **Firestore Database**.
3. In "Project Settings" > "Service Accounts", generate a new private key (JSON).
4. Copy the content of this JSON.

### 3. Variable Configuration
Rename the `.env.example` file to `.env` and fill it in:
```env
TELEGRAM_BOT_TOKEN="YOUR_TOKEN_HERE"
FIREBASE_SERVICE_ACCOUNT_KEY="PASTE_JSON_HERE"
X-Telegram-Bot-Api-Secret-Token="CHOOSE_A_SECURE_PASSWORD"
```

### 4. Running the Setup Script
To make it easier, run our PowerShell script:
```powershell
./setup.ps1
```

---

## 🌎 Mercado Internacional
Para documentação em Português, acesse [README.md](README.md).
