import { getBotSettings, saveUser, saveGroup, findAutomation, db, incrementMessageCount } from "../../../src/lib/db.js";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Memory Cache
let cachedSettings = null;
let lastFetch = 0;

// Cooldown Management
const commandCooldowns = new Map();

export async function POST(req) {
    const response = new Response("OK", { status: 200 });

    try {
        const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
        const MY_SECRET = "SUDO_FLUX_SECURE_TOKEN_2026";
        if (secretHeader !== MY_SECRET) return response;

        const body = await req.json();
        const now = Date.now();

        if (!cachedSettings || (now - lastFetch > 30000)) {
            cachedSettings = await getBotSettings();
            lastFetch = now;
        }

        let token = cachedSettings?.telegram_token || process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return response;
        token = token.trim();

        // --- HELPER SEND FUNCTION ---
        const sendResponse = async (chatId, text, buttons, imageUrl, msgId) => {
            const keyboard = buttons?.length > 0 ? {
                inline_keyboard: buttons.map(b => ([{
                    text: b.label,
                    [b.type === 'url' ? 'url' : 'callback_data']: b.value
                }]))
            } : null;

            if (imageUrl && imageUrl.startsWith('data:image')) {
                try {
                    const base64Data = imageUrl.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const formData = new FormData();
                    const blob = new Blob([buffer], { type: 'image/jpeg' });

                    formData.append('chat_id', chatId);
                    formData.append('photo', blob, 'image.jpg');
                    if (text) formData.append('caption', text);
                    formData.append('parse_mode', 'HTML');
                    if (keyboard) formData.append('reply_markup', JSON.stringify(keyboard));
                    if (msgId) formData.append('reply_to_message_id', msgId);

                    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: formData });
                    return;
                } catch (e) { console.error("Webhook SendImage Error:", e); }
            }

            const endpoint = imageUrl ? 'sendPhoto' : 'sendMessage';
            const payload = {
                chat_id: chatId,
                parse_mode: "HTML",
                reply_markup: keyboard,
                reply_to_message_id: msgId
            };

            if (imageUrl) {
                payload.photo = imageUrl;
                payload.caption = text;
            } else {
                payload.text = text;
            }

            await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => { });
        };

        // --- GROUP AUTHORIZATION CHECK & REGISTRATION ---
        const handleGroupAuth = async (chat) => {
            if (!chat || chat.type === "private") return true;
            if (!db) return true;

            const groupRef = db.collection("groups").doc(String(chat.id));
            const groupDoc = await groupRef.get();

            if (groupDoc.exists) {
                return groupDoc.data().authorized === true;
            }

            // NEW GROUP: Auto-register and keep unauthorized
            await saveGroup(chat).catch(() => { });
            return false;
        };

        // --- GLOBAL MESSAGE PROCESSING ---
        if (body.message) {
            const chatId = body.message.chat.id;
            const chatType = body.message.chat.type;
            const text = body.message.text?.toLowerCase().trim();

            // 1. Log Groups (including new add events)
            if (chatType !== "private") {
                const authorized = await handleGroupAuth(body.message.chat);
                if (!authorized) return response; // Silent Block
            } else {
                // Private Chat / Leads
                saveUser(body.message.from).catch(() => { });
                // New Lead Notification logic...
                if (db && body.message.text) {
                    try {
                        const userDoc = await db.collection("leads").doc(String(body.message.from.id)).get();
                        if (!userDoc.exists) {
                            await db.collection("notifications").add({
                                title: "Novo Lead Detectado",
                                message: `Usuário @${body.message.from.username || body.message.from.first_name} iniciou o bot.`,
                                type: "lead",
                                created_at: new Date(),
                                read: false
                            });
                        }
                    } catch (e) { }
                }
            }

            // 2. Process Commands ONLY if text exists
            if (text) {
                incrementMessageCount().catch(() => { });

                if (chatType === "private" && text === "/start") {
                    await sendResponse(chatId, cachedSettings?.welcome_message, cachedSettings?.welcome_buttons, cachedSettings?.welcome_image);
                } else {
                    const match = await findAutomation(text);
                    if (match) {
                        const validScope = !match.scope || match.scope === 'global' ||
                            (match.scope === 'private' && chatType === 'private') ||
                            (match.scope === 'group' && (chatType !== 'private'));

                        if (validScope) {
                            const userId = body.message.from.id;
                            if (match.cooldown && match.cooldown > 0) {
                                const cooldownKey = `${userId}:${match.trigger}`;
                                const lastUsed = commandCooldowns.get(cooldownKey) || 0;
                                if (now - lastUsed < (match.cooldown * 1000)) return response;
                                commandCooldowns.set(cooldownKey, now);
                            }
                            await sendResponse(chatId, match.response, match.buttons, match.image_url, chatType !== "private" ? body.message.message_id : null);
                        }
                    }
                }
            }
        }

        // --- MY CHAT MEMBER HANDLER (Bot added/removed) ---
        if (body.my_chat_member) {
            const chat = body.my_chat_member.chat;
            if (chat.type !== "private") {
                await saveGroup(chat).catch(() => { });
            }
        }

        // --- CALLBACK QUERY HANDLER ---
        if (body.callback_query) {
            const chatId = body.callback_query.message.chat.id;
            const authorized = await handleGroupAuth(body.callback_query.message.chat);
            if (!authorized) return response;

            const callbackData = body.callback_query.data;
            const match = await findAutomation(callbackData);
            if (match) {
                const userId = body.callback_query.from.id;
                if (match.cooldown && match.cooldown > 0) {
                    const cooldownKey = `${userId}:${match.trigger}`;
                    const lastUsed = commandCooldowns.get(cooldownKey) || 0;
                    if (now - lastUsed < (match.cooldown * 1000)) {
                        fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                callback_query_id: body.callback_query.id,
                                text: `Aguarde ${match.cooldown}s...`,
                                show_alert: false
                            })
                        }).catch(() => { });
                        return response;
                    }
                    commandCooldowns.set(cooldownKey, now);
                }
                await sendResponse(chatId, match.response, match.buttons, match.image_url);
            }
            fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: body.callback_query.id })
            }).catch(() => { });
        }

        return response;

    } catch (err) {
        console.error("Critical Webhook Error:", err.message);
        return response;
    }
}

export async function GET() {
    return new Response("SudoFlux Hyper-Core Webhook [EN-US] ACTIVE 🛰️", { status: 200 });
}