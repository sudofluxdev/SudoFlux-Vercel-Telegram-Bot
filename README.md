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
2. Ative o **Firestore Database** e escolha o local do servidor.
3. Ative o **Firebase Authentication**:
   - Vá em "Authentication" > "Sign-in method".
   - Ative o provedor **Google**. 
   - Configure o e-mail de suporte do projeto.
4. **Regras do Firestore**:
   - Vá em "Firestore Database" > "Rules".
   - Use as regras básicas (ou as que estão no arquivo `firestore.rules` do projeto) para permitir que usuários autenticados gerenciem o dashboard.
5. Em "Project Settings" > "Service Accounts", gere uma nova chave privada (JSON).
6. Copie o conteúdo desse JSON.

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

### 5. Hospedagem na Vercel (100% Online)
1. Crie uma conta na [Vercel](https://vercel.com).
2. Conecte seu repositório do GitHub ou use a [Vercel CLI](https://vercel.com/download).
3. No painel da Vercel, vá em **Project Settings > Environment Variables** e adicione:
   - `TELEGRAM_BOT_TOKEN`: O token do seu bot.
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: O JSON completo da sua Service Account do Firebase.
   - `X-Telegram-Bot-Api-Secret-Token`: Uma senha forte (idêntica à do seu webhook).
4. Faça o **Deploy**.

### 6. Configurando o Webhook (Obrigatório)
Após o deploy, você precisa dizer ao Telegram para onde enviar as mensagens:
1. Acesse o seu dashboard (Ex: `https://sua-app.vercel.app/dashboard/settings`).
2. Clique em **"Update Webhook"** ou use o botão de configuração para salvar o token e a URL automaticamente.

### 7. Garantindo Precisão no Timer (Opcional mas Recomendado)
Para máxima confiabilidade e precisão de 1 minuto nos seus broadcasts:
1. Crie uma conta gratuita em [cron-job.org](https://console.cron-job.org/signup).
2. Crie um novo "Job" apontando para a URL do seu bot: `https://sua-app.vercel.app/api/cron`.
3. Defina para rodar a cada **1 minuto**.
4. Isso garante que o bot nunca "durma" e envie as mensagens agendadas exatamente na hora.

---

## 📜 Termos, Condições e Futuro (Roadmap)

### 🚨 Importante: Conhecimento Técnico
Este projeto é fornecido como um pacote de código-fonte. O comprador deve ter conhecimentos básicos em:
- **Vercel / Firebase**: Para hospedagem e banco de dados.
- **Git / Node.js**: Para manipulação de arquivos e comandos básicos.

### 🔄 Processo de Atualização e Licenciamento
- **Plano Standard ($250.00)**: Acesso total ao código-fonte e dashboard na versão atual (V1.0). Não inclui atualizações para novas funcionalidades futuras.
- **Plano Ultimate ($500.00)**: Acesso total ao código + **Atualizações Vitalícias**. Este plano inclui todas as futuras integrações do Roadmap (IA, Stripe, Cripto, etc) sem custos adicionais.
- **Garantia de Preço**: Quem adquirir as licenças agora garante o preço de lançamento. Conforme novas integrações (IA, Stripe, Cripto) forem adicionadas, o valor para novos compradores subirá significativamente para refletir o novo poder da ferramenta.

### 💼 Uso Comercial
- O uso comercial (venda de serviços/bots para terceiros/White Label) é permitido. Com o plano Standard, você revende a versão atual. Com o plano Ultimate, você pode oferecer atualizações contínuas para seus clientes.
- O comprador é responsável por gerenciar seu próprio banco de dados (Firebase).

### 🛰️ Futuras Integrações (Roadmap para Plano Ultimate)
Quem possui o **Plano Ultimate** terá acesso às seguintes integrações futuras sem custo adicional no código:
- **IA Auto-Chat**: Integração com LLMs (OpenAI/Anthropic) para respostas inteligentes automáticas.
- **Stripe**: Integração de Pagamentos dinâmicos.
- APIs de Venda e Checkout automatizado.
- Monitoramento e atualização em tempo real de **Criptomoedas**.
- Novas integrações variam conforme o modelo de bot escolhido.

### 📧 Contato e Suporte
Para uso exclusivo corporativo ou customizações enterprise:
- **Email**: sudofluxdev@gmail.com
- **Localização**: Brasil 🇧🇷
- **Fuso Horário**: GMT-3 (Horário de Brasília)

---

## 🌎 International Market
Para documentação em Inglês, acesse [README_EN.md](README_EN.md).