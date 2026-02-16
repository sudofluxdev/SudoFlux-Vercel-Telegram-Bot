# 🛰️ SudoSquad - Telegram Matrix System (V1.5)

<div align="center">
  <img src="https://img.shields.io/badge/Version-FREE-green?style=for-the-badge&logo=github" alt="Free Version">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Database-Firebase-orange?style=for-the-badge&logo=firebase" alt="Firebase">
  <br>
  <a href="https://ko-fi.com/sudoflux">
    <img src="https://img.shields.io/badge/Support_the_Project-Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Support on Ko-fi">
  </a>
</div>

---

SudoSquad is a professional-grade infrastructure for high-performance Telegram automation. This is the community **free version**, designed to be scalable and 100% free to host.

## 🚀 Elite Features
- **Telegram Hub**: Centralized management for Channels and Transmissions.
- **Neural Analytics**: Real-time flux stats and uptime monitoring.
- **Advanced CRM**: Lead capture with full interaction history.
- **Keyword Intelligence**: Triggers by Keyword, Regex, and Exact Match.
- **Smart Broadcast**: Scheduled messaging with scope-based targeting.

## � Why Vercel & Firebase?
We chose this stack because it allows you to get your bot up and running **without spending a dime**:
- **Vercel**: High-performance serverless hosting with an extremely generous free tier.
- **Firebase**: NoSQL database (Firestore) and Authentication that scale for free to thousands of users.

---

## �🛠️ Step-by-Step Installation

### 1. Requirements
- [Node.js](https://nodejs.org/) (Version 18+)
- [Firebase Console](https://console.firebase.com/) account
- [Vercel](https://vercel.com/) account

### 2. Firebase Setup
1. Create a Firebase project.
2. Enable **Firestore Database** (Production or Test mode).
3. Enable **Authentication** and turn on the **Google** provider (for the dashboard).
4. Go to `Project Settings` > `Service Accounts`.
5. Click **"Generate new private key"**. This will download a JSON file.

### 3. Variable Configuration
Rename the `.env.example` file to `.env` and fill it in:
```env
TELEGRAM_BOT_TOKEN="YOUR_BOTFATHER_TOKEN"
FIREBASE_SERVICE_ACCOUNT_KEY="PASTE_JSON_CONTENT_HERE_IN_ONE_LINE"
X-Telegram-Bot-Api-Secret-Token="CREATE_A_SECURE_PASSWORD"
```

### 4. Vercel Deployment
1. Connect your repository to Vercel.
2. Add the same variables from `.env` to the **Environment Variables** in your Vercel project.
3. Click **Deploy**.

### 5. Webhook Activation
1. After deployment, go to `https://your-domain.vercel.app/dashboard/settings`.
2. Click **"Update Webhook"**. The system will automatically send your Vercel URL to Telegram.

---

## 💎 Custom Version & Support
Need something specific? An exclusive feature or custom integration?
I provide tailor-made development services. Pricing is discussed based on your project's complexity.

**Contact me for quotes.**

## 🗺️ Roadmap & Support
Depending on the number of supporters on [Ko-fi](https://ko-fi.com/sudoflux), upcoming major updates will include:
- [ ] Native **Discord** integration.
- [ ] Multi-platform sync (Telegram + Discord).
- [ ] Advanced AI for automated responses.

## ⚖️ License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 🌎 International Market

## 🌎 International Market
For documentation in Portuguese, please access [README.md](README.md).
