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
2. Enable **Firestore Database** and choose the server location.
3. Enable **Firebase Authentication**:
   - Go to "Authentication" > "Sign-in method".
   - Enable the **Google** provider.
   - Set the project support email.
4. **Firestore Rules**:
   - Go to "Firestore Database" > "Rules".
   - Use basic rules (or the ones in the `firestore.rules` file) to allow authenticated users to manage the dashboard.
5. In "Project Settings" > "Service Accounts", generate a new private key (JSON).
6. Copy the content of this JSON.

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

### 5. Hosting on Vercel (100% Online)
1. Create an account at [Vercel](https://vercel.com).
2. Connect your GitHub repository or use the [Vercel CLI](https://vercel.com/download).
3. In the Vercel dashboard, go to **Project Settings > Environment Variables** and add:
   - `TELEGRAM_BOT_TOKEN`: Your bot token.
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: The full JSON from your Firebase Service Account.
   - `X-Telegram-Bot-Api-Secret-Token`: A strong password (must match your webhook secret).
4. Perform the **Deploy**.

### 6. Configuring the Webhook (Mandatory)
After deployment, you must tell Telegram where to send messages:
1. Access your dashboard (e.g., `https://your-app.vercel.app/dashboard/settings`).
2. Click **"Update Webhook"** or use the configuration button to save the token and URL automatically.

### 7. Ensuring Timer Precision (Optional but Recommended)
For maximum reliability and 1-minute precision on broadcasts:
1. Create a free account at [cron-job.org](https://console.cron-job.org/signup).
2. Create a new "Job" pointing to your deployment URL: `https://your-app.vercel.app/api/cron`.
3. Set it to run every **1 minute**.
4. This ensures your bot never "sleeps" and always sends scheduled messages on time.

---

## 📜 Terms, Conditions & Roadmap

### 🚨 Important: Technical Knowledge
This project is provided as a source code package. The buyer is expected to have basic skills in:
- **Vercel / Firebase**: For hosting and database setup.
- **Git / Node.js**: For file management and basic commands.

### 🔄 Update Process
- **Pricing (Upfront)**: The **Full Plan** upfront cost is **$250.00**. This grants full access to the source code and dashboard.
- **Update Subscription**: To receive ongoing service updates, new API integrations, and bug fixes, there is a recurring fee of **$25.00/month**.
- **Early-Bird Growth**: Pricing will increase as the ecosystem expands, but early adopters lock in these preferential terms.

### 💼 Commercial Use
- Commercial use (selling services/bots to third parties/White Label) is allowed as long as the update subscription is active. 
- If the subscription is cancelled, you retain the last stable version received but lose access to future Roadmap integrations.

### 🛰️ Future Roadmap (Full Plan)
Buyers of the **Full Plan** will get access to these future integrations at no extra cost for the code (update fees still apply):
- **Stripe** Integration (Payments).
- Sales & Checkout APIs.
- Real-time **Cryptocurrency** updates.
- Integrations vary depending on the bot model chosen.

### 📧 Contact & Support
For dedicated corporate implementations or enterprise customization:
- **Email**: sudofluxdev@gmail.com
- **Location**: Brazil 🇧🇷
- **Timezone**: GMT-3

---

## 🌎 Mercado Internacional
Para documentação em Português, acesse [README.md](README.md).
