import { Bot } from "grammy";
import { saveUser, getBotSettings, findAutomation } from "./lib/db.js";

// Função que configura os handlers no bot
export const setupBot = (bot) => {
    // 0. Teste de Vida
    bot.command("ping", async (ctx) => {
        await ctx.reply("🛰️ PONG! O robô está ouvindo e respondendo.");
    });

    // 1. Comando Welcome (/start)
    bot.command("start", async (ctx) => {
        console.log("Start command hit");
        saveUser(ctx.from).catch(e => console.error("Lead save error:", e));

        const settings = await getBotSettings();
        const welcome = settings?.welcome_message || "👋 Olá! Bem-vindo ao SudoFlux.";
        await ctx.reply(welcome);
    });

    // 2. Mensagens de texto (Keywords & Default)
    bot.on("message:text", async (ctx) => {
        const text = ctx.message.text.toLowerCase();
        saveUser(ctx.from).catch(e => console.error("Lead save error:", e));

        // Tenta achar automação
        const match = await findAutomation(text);
        if (match) {
            return await ctx.reply(match.response);
        }

        // Resposta padrão
        const settings = await getBotSettings();
        if (settings?.default_reply) {
            await ctx.reply(settings.default_reply);
        }
    });
};

// Instância padrão para uso local ou legada
const token = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOmcq';
const bot = new Bot(token);
setupBot(bot);

export default bot;
