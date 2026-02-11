import { Bot } from "grammy";
import { saveUser, getBotSettings, findAutomation, getAllAutomations, saveChatMessage, getChatHistory } from "./lib/db.js";
import { aiBridge } from "./lib/ai/index.js";

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

    // 2. Text Messages (Keywords & Smart Brain AI)
    bot.on("message:text", async (ctx) => {
        const text = ctx.message.text;
        const chatId = ctx.from.id;
        const chatType = ctx.chat.type;
        console.log(`🛰️ [BOT] Message from ${chatId} (${chatType}): "${text}"`);

        saveUser(ctx.from).catch(e => console.error("Lead save error:", e));

        // Try to find automation match (exact/keyword)
        const match = await findAutomation(text);
        if (match) {
            console.log(`🛰️ [BOT] Automation match found: ${match.trigger}`);
            return await ctx.reply(match.response);
        }

        // Smart Brain Fallback
        const settings = await getBotSettings();

        // 🛡️ AI scope enforcement
        const scope = settings?.ai_scope || 'global';
        console.log(`🛰️ [BOT] Resolved AI Scope: ${scope} | Actual Type: ${chatType}`);

        const isPrivate = chatType === 'private';
        const isGroup = chatType === 'group' || chatType === 'supergroup';

        if (scope === 'private' && !isPrivate) {
            console.log("🛰️ [BOT] Scope restriction: Private only.");
            return;
        }
        if (scope === 'group' && !isGroup) {
            console.log("🛰️ [BOT] Scope restriction: Group only.");
            return;
        }

        // If AI is disabled or keys missing, use default_reply
        if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
            console.warn("🛰️ [BOT] AI Keys missing in environment.");
            if (settings?.default_reply) {
                return await ctx.reply(settings.default_reply);
            }
            return;
        }

        try {
            // Show typing indicator
            await ctx.replyWithChatAction("typing");

            // Fetch context
            const history = await getChatHistory(chatId, 10);
            const automations = await getAllAutomations();

            // Ask Smart Brain
            console.log("🛰️ [BOT] Invoking Smart Brain...");
            const response = await aiBridge.ask(text, {
                settings,
                history,
                commands: automations
            });

            if (response) {
                console.log("🛰️ [BOT] AI Response generated.");
                // Save to history
                await saveChatMessage(chatId, "user", text);
                await saveChatMessage(chatId, "model", response);

                await ctx.reply(response, { parse_mode: "Markdown" });
            } else {
                console.log("🛰️ [BOT] AI returned empty response.");
            }
        } catch (e) {
            console.error("🛰️ [BOT] Smart Brain Error:", e.message);
            if (settings?.default_reply) {
                await ctx.reply(settings.default_reply);
            }
        }
    });
};

// Default instance for local or legacy use
const token = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOmcq';
const bot = new Bot(token);
setupBot(bot);

export default bot;
