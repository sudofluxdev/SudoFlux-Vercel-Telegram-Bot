import { Bot } from "grammy";
import { saveUser, getBotSettings, findAutomation } from "./lib/db.js";

// Function to configure bot handlers
export const setupBot = (bot) => {
    // 0. Health Check
    bot.command("ping", async (ctx) => {
        await ctx.reply("🛰️ PONG! O robô está ouvindo e respondendo.");
    });

    // 1. Welcome Command (/start)
    bot.command("start", async (ctx) => {
        console.log("Start command hit");
        saveUser(ctx.from).catch(e => console.error("Lead save error:", e));

        const settings = await getBotSettings();
        const welcome = settings?.welcome_message || "👋 Olá! Bem-vindo ao SudoFlux.";
        await ctx.reply(welcome);
    });

    // 2. Text Messages (Keywords & Default)
    bot.on("message:text", async (ctx) => {
        const text = ctx.message.text.toLowerCase();
        saveUser(ctx.from).catch(e => console.error("Lead save error:", e));

        // Try to find automation match
        const match = await findAutomation(text);
        if (match) {
            return await ctx.reply(match.response);
        }

        // Default reply
        const settings = await getBotSettings();
        if (settings?.default_reply) {
            await ctx.reply(settings.default_reply);
        }
    });
};

// Default instance for local or legacy use
const token = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOmcq';
const bot = new Bot(token);
setupBot(bot);

export default bot;
