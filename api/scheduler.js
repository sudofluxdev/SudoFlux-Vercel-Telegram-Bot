import { getPendingFollowups, updateFollowup } from '../src/lib/db.js';
import bot from '../src/bot.js';

export default async function handler(req, res) {
    // Simple auth to prevent unauthorized hits to this endpoint
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const pendingLeads = await getPendingFollowups();
    let count = 0;

    for (const lead of pendingLeads) {
        try {
            // Logic for follow-up sequence
            // Example: If no messages sent yet, send 24h follow-up
            await bot.api.sendMessage(lead.chatId, "👋 Olá! Passando para ver se você tem alguma dúvida sobre nossos serviços.");

            // Update nextMessageAt to 48h from now (or null if end of sequence)
            const nextDate = null; // End of sequence for this simple example
            await updateFollowup(lead.chatId, nextDate);

            count++;
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
            console.error(`Follow-up failed for ${lead.chatId}:`, err);
        }
    }

    return res.status(200).json({ status: 'ok', processed: count });
}
