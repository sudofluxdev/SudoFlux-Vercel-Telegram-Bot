import { Bot } from 'grammy';
import { saveUser, getAllLeads } from './lib/db.js';
import { adminOnly } from './middleware/admin.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Welcome Trigger
bot.command('start', async (ctx) => {
    const isNew = await saveUser(ctx.from.id, ctx.from.username, ctx.from.first_name);

    if (isNew) {
        await ctx.reply(`👋 Olá ${ctx.from.first_name}! Bem-vindo ao nosso serviço.\n\nFique atento às nossas atualizações!`);
    } else {
        await ctx.reply("Bem-vindo de volta! 🚀");
    }
});

// Broadcast Command with Rate Limiting
bot.command('broadcast', adminOnly, async (ctx) => {
    const message = ctx.match;
    if (!message) return ctx.reply("❌ Uso: /broadcast Sua mensagem aqui");

    const leads = await getAllLeads();
    let successCount = 0;
    let failCount = 0;

    await ctx.reply(`📣 Iniciando broadcast para ${leads.length} leads...`);

    for (const lead of leads) {
        try {
            await bot.api.sendMessage(lead.chatId, message);
            successCount++;
            // Safety delay to avoid rate-limiting (30 messages per second is Telegram's limit, let's be safe)
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
            console.error(`Failed to send to ${lead.chatId}:`, err);
            failCount++;
        }
    }

    await ctx.reply(`✅ Broadcast finalizado!\n🎯 Sucesso: ${successCount}\n❌ Falhas: ${failCount}`);
});

export default bot;
