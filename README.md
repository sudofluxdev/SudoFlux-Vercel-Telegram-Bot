# 🛰️ SudoFlux - Telegram Matrix System (V1.5)

<div align="center">
  <img src="https://img.shields.io/badge/Versão-FREE-green?style=for-the-badge&logo=github" alt="Versão Free">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Database-Firebase-orange?style=for-the-badge&logo=firebase" alt="Firebase">
  <br>
  <a href="https://ko-fi.com/sudoflux">
    <img src="https://img.shields.io/badge/Apoie_o_Projeto-Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Apoie no Ko-fi">
  </a>
</div>

---

SudoFlux é uma infraestrutura de nível profissional para automação de Telegram de alta performance. Esta é a **versão gratuita** comunitária, projetada para ser escalável e 100% gratuita para hospedar.

## 🚀 Funcionalidades de Elite
- **Telegram Hub**: Gestão centralizada de Canais e Transmissões.
- **Neural Analytics**: Estatísticas de fluxo e uptime em tempo real.
- **CRM Avançado**: Captura de leads com histórico completo de interações.
- **Keyword Intelligence**: Gatilhos por Keyword, Regex e Match Exato.
- **Smart Broadcast**: Disparo agendado com segmentação de escopo.

## 💡 Por que Vercel & Firebase?
Escolhemos esta stack porque permite que você coloque seu bot no ar **sem gastar um centavo**:
- **Vercel**: Hospedagem serverless de alta performance com plano gratuito extremamente generoso.
- **Firebase**: Banco de dados NoSQL (Firestore) e Autenticação que escalam de graça para milhares de usuários.

---

## 🛠️ Instalação Passo a Passo

### 1. Requisitos
- [Node.js](https://nodejs.org/) (Versão 18+)
- Conta no [Firebase Console](https://console.firebase.com/)
- Conta na [Vercel](https://vercel.com/)

### 2. Configuração do Firebase
1. Crie um projeto no Firebase.
2. Ative o **Firestore Database** (Modo Produção ou Teste).
3. Ative o **Authentication** e habilite o provedor **Google** (para o dashboard).
4. Vá em `Configurações do Projeto` > `Contas de Serviço`.
5. Clique em **"Gerar nova chave privada"**. Isso baixará um arquivo JSON.

### 3. Configuração de Variáveis
Renomeie o arquivo `.env.example` para `.env` e preencha:
```env
TELEGRAM_BOT_TOKEN="SEU_TOKEN_DO_BOTFATHER"
FIREBASE_SERVICE_ACCOUNT_KEY="COLE_AQUI_O_CONTEUDO_DO_JSON_EM_UMA_LINHA"
X-Telegram-Bot-Api-Secret-Token="CRIE_UMA_SENHA_SEGURA"
```

### 4. Deploy na Vercel
1. Conecte seu repositório à Vercel.
2. Adicione as mesmas variáveis do `.env` nas **Environment Variables** do projeto na Vercel.
3. Clique em **Deploy**.

### 5. Ativação do Webhook
1. Após o deploy, acesse `https://seu-dominio.vercel.app/dashboard/settings`.
2. Clique em **"Update Webhook"**. O sistema enviará sua URL da Vercel para o Telegram automaticamente.

### 6. Cron Job (Agendamento & Wake up)
Para garantir que os disparos agendados (Smart Broadcast) funcionem e que o bot esteja sempre "acordado":
1. Use um serviço de Cron (recomendado: [cron-job.org](https://cron-job.org)).
2. Configure uma requisição **GET** para `https://seu-dominio.vercel.app/api/cron`.
3. Defina a frequência para **cada 1 minuto**.

---

## 💎 Versão Personalizada & Suporte
Precisa de algo específico? Uma funcionalidade exclusiva ou integração customizada?
Eu realizo desenvolvimentos sob medida. O valor é combinado de acordo com a complexidade do seu projeto.

**Entre em contato para orçamentos.**

## 🗺️ Roadmap & Apoio
Dependendo do número de apoiadores no [Ko-fi](https://ko-fi.com/sudoflux), as próximas grandes atualizações incluirão:
- [ ] Integração nativa com **Discord**.
- [ ] Multi-plataforma (Telegram + Discord sincronizados).
- [ ] IA Avançada para respostas automáticas.

## ⚖️ Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🌎 International Market
For documentation in English, please access [README_EN.md](README_EN.md).