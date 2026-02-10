# 🛰️ BotSudo V1.0 - Hyper-Core Telegram System

O BotSudo é uma estrutura completa para automação de canais e grupos de Telegram, acompanhada de um Dashboard administrativo premium.

## 🚀 Funcionalidades Principais
- **Dashboard Minimalista**: Gestão total via interface web ultra-rápida.
- **Smart Broadcast**: Envio programado de mensagens e mídias com intervalos personalizados.
- **Automação Inteligente**: Respostas automáticas baseadas em gatilhos (triggers) com suporte a botões inline.
- **Gestão de Leads**: Captura automática de usuários que interagem com o bot.
- **Sistema de Autorização**: Controle total sobre quais grupos o bot pode atuar.

## 🛠️ Instalação Passo a Passo

### 1. Requisitos
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- Uma conta no [Firebase](https://console.firebase.google.com/)
- Uma conta no [Vercel](https://vercel.com/) (Opcional, para hospedagem)
- Token de um Bot do Telegram [@BotFather](https://t.me/BotFather)

### 2. Configuração do Firebase
1. Crie um projeto no Firebase.
2. Ative o **Firestore Database**.
3. Em "Project Settings" > "Service Accounts", gere uma nova chave privada (JSON).
4. Copie o conteúdo desse JSON.

### 3. Configuração de Variáveis
Renomeie o arquivo `.env.example` para `.env` e preencha:
```env
TELEGRAM_BOT_TOKEN="SEU_TOKEN_AQUI"
FIREBASE_SERVICE_ACCOUNT_KEY="COLE_O_JSON_AQUI_DENTRO"
X-Telegram-Bot-Api-Secret-Token="ESCOLHA_UMA_SENHA_SEGURA"
```

### 4. Rodando o Script de Setup
Para facilitar, execute nosso script no PowerShell:
```powershell
./setup.ps1
```

### 5. Garantindo Precisão no Timer (Opcional mas Recomendado)
Para máxima confiabilidade e precisão de 1 minuto nos seus broadcasts:
1. Crie uma conta gratuita em [cron-job.org](https://console.cron-job.org/signup).
2. Crie um novo "Job" apontando para a URL do seu bot: `https://sua-app.vercel.app/api/cron`.
3. Defina para rodar a cada **1 minuto**.
4. Isso garante que o bot nunca "durma" e envie as mensagens agendadas exatamente na hora.

---

## 🌎 International Market
For English documentation, please check [README_EN.md](README_EN.md).