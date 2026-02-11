# 🛰️ BotFlux V1.5 - Omnichannel Matrix System

BotFlux é uma infraestrutura de nível profissional para automação de Telegram de alta performance.

## 🚀 Funcionalidades de Elite
- **Omnichannel Hub**: Gestão centralizada de Canais (Telegram e WhatsApp UI).
- **Neural Analytics**: Estatísticas de fluxo e uptime em tempo real.
- **CRM Avançado**: Captura de leads com histórico completo de interações.
- **Keyword Intelligence**: Gatilhos por Keyword, Regex e Match Exato.
- **Smart Broadcast**: Disparo agendado com segmentação de escopo.

## 🛠️ Instalação Passo a Passo

### 1. Requisitos
- [Node.js](https://nodejs.org/) (Versão 18+)
- Conta no [Firebase](https://console.firebase.com/)
- Conta na [Vercel](https://vercel.com/)

### 2. Configuração do Firebase
1. Crie um projeto no Firebase.
2. Ative o **Firestore Database** e **Authentication** (Google). 
3. Em "Service Accounts", gere uma nova chave privada (JSON).

### 3. Configuração de Variáveis
Renomeie o arquivo `.env.example` para `.env` e preencha:
```env
TELEGRAM_BOT_TOKEN="SEU_TOKEN"
FIREBASE_SERVICE_ACCOUNT_KEY="JSON_FIREBASE"
X-Telegram-Bot-Api-Secret-Token="SUA_SENHA_WEBHOOK"
```

### 4. Deploy & Webhook
1. Faça o deploy na Vercel.
2. Acesse `/dashboard/settings` no seu domínio.
3. Clique em **"Update Webhook"** para sincronizar o bot.

### 5. Cron Job (Agendamento)
Para disparos agendados, configure um Cron Job (ex: cron-job.org) apontando para `https://seu-slug.vercel.app/api/cron` a cada 1 minuto.

---

## 🌎 International Market
For documentation in English, please access [README_EN.md](README_EN.md).