/**
 * BotFlux V1.5 - Core Webhook Handler
 * 🛰️ [PT] Central de processamento de mensagens do Telegram
 * 🛰️ [EN] Telegram message processing hub
 */

import {
    getBotSettings,
    saveUser,
    saveGroup,
    findAutomation,
    db,
    incrementMessageCount,
    saveChatMessage,
    getChatHistory,
    getAllAutomations
} from "../../../src/lib/db.js";
import { aiBridge } from "../../../src/lib/ai/index.js";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// [PT] Cache em memória para evitar excesso de requisições ao banco
// [EN] In-memory cache to prevent excessive database requests
let cachedSettings = null;
let lastFetch = 0;

// [PT] Gerenciamento de Cooldown (Anti-Spam)
// [EN] Cooldown Management (Anti-Spam)
const commandCooldowns = new Map();
const aiCooldowns = new Map();

export async function POST(req) {
    const response = new Response("OK", { status: 200 });

    try {
        const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
        const MY_SECRET = process.env.X_TELEGRAM_BOT_API_SECRET_TOKEN || "PLACEHOLDER_SECRET";

        /**
         * [PT] Verificação de Token de Segurança (X-Telegram-Bot-Api-Secret-Token)
         * [EN] Security Token Verification (X-Telegram-Bot-Api-Secret-Token)
         */
        if (MY_SECRET && secretHeader !== MY_SECRET) { // Added check for MY_SECRET existence
            console.warn(`⚠️ [WEBHOOK] Secret Mismatch. Header: ${secretHeader}. Expected: ${MY_SECRET}`);
            // Removed specific error log and return for incorrect secret, now just warns
            return new Response("FORBIDDEN", { status: 403 }); // Always return 403 if secret is set and mismatch
        }
        // Removed "Proceeding without secret (Setup Phase)" log as it's not a setup phase anymore

        const body = await req.json();
        const now = Date.now();

        // [PT] Atualiza as configurações caso o cache tenha expirado (30s)
        // [EN] Update settings if cache has expired (30s)
        if (!cachedSettings || (now - lastFetch > 30000)) {
            cachedSettings = await getBotSettings();
            lastFetch = now;
        }

        let token = cachedSettings?.telegram_token || process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            console.error("❌ [WEBHOOK] TELEGRAM_BOT_TOKEN is missing!");
            return response;
        }
        token = token.trim();

        /**
         * [PT] Função Auxiliar: Envio de Respostas (Texto, Imagem, Botões)
         * [EN] Helper Function: Sending Responses (Text, Image, Buttons)
         */
        const sendResponse = async (chatId, text, buttons, imageUrl, msgId) => {
            const keyboard = buttons?.length > 0 ? {
                inline_keyboard: buttons.map(b => ([{
                    text: b.label,
                    [b.type === 'url' ? 'url' : 'callback_data']: b.value
                }]))
            } : null;

            // [PT] Suporte para Base64 (Imagens geradas localmente)
            // [EN] Support for Base64 (Locally generated images)
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

            try {
                const tgRes = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const tgData = await tgRes.json();
                if (!tgData.ok) {
                    console.error("❌ [TELEGRAM ERROR]:", tgData.description);
                } else {
                    // [PT] CRM: Registra a resposta do bot no histórico
                    // [EN] CRM: Log the bot's response in the history
                    if (text) {
                        saveChatMessage(chatId, 'model', text).catch(() => { });
                    }
                }
            } catch (e) {
                console.error("❌ [TELEGRAM SEND CRITICAL]:", e.message);
            }
        };

        /**
         * [PT] Verificação de Autorização de Grupo
         * [EN] Group Authorization Verification
         */
        const handleGroupAuth = async (chat) => {
            if (!chat || chat.type === "private") return true;
            if (!db) return true;

            const groupRef = db.collection("groups").doc(String(chat.id));
            const groupDoc = await groupRef.get();

            if (groupDoc.exists) {
                return groupDoc.data().authorized === true;
            }

            // [PT] Novo grupo detectado: registra mas permanece não autorizado
            // [EN] New group detected: register but keep unauthorized
            await saveGroup(chat).catch(() => { });
            return false;
        };

        /**
         * [PT] Processamento Principal de Mensagens
         * [EN] Main Message Processing
         */
        if (body.message) {
            const chatId = body.message.chat.id;
            const chatType = body.message.chat.type;
            const text = body.message.text?.toLowerCase().trim();

            if (chatType !== "private") {
                const authorized = await handleGroupAuth(body.message.chat);
                if (!authorized) {
                    console.log(`🚫 [WEBHOOK] Group ${chatId} not authorized.`);
                    return response;
                }
            } else {
                // [PT] Fluxo de Leads Privados
                // [EN] Private Leads Flow
                saveUser(body.message.from).catch(() => { });

                // [PT] Notificação de Novo Lead
                // [EN] New Lead Notification
                if (db && body.message.text) {
                    try {
                        const userDoc = await db.collection("leads").doc(String(body.message.from.id)).get();
                        if (!userDoc.exists) {
                            await db.collection("notifications").add({
                                title: "New Lead Detected",
                                message: `User @${body.message.from.username || body.message.from.first_name} has started the bot.`,
                                type: "lead",
                                created_at: new Date(),
                                read: false
                            });
                        }
                    } catch (e) { }
                }
            }

            // [PT] Automação e Inteligência
            // [EN] Automation and Intelligence
            if (text) {
                incrementMessageCount().catch(() => { });
                // [PT] CRM: Regista a mensagem do usuário
                // [EN] CRM: Log the user's message
                saveChatMessage(chatId, 'user', text).catch(() => { });

                if (chatType === "private" && text === "/start") {
                    await sendResponse(chatId, cachedSettings?.welcome_message, cachedSettings?.welcome_buttons, cachedSettings?.welcome_image);
                } else {
                    /**
                     * [PT] Busca por Automação Reativa (Keyword/Regex/Exact)
                     * [EN] Search for Reactive Automation (Keyword/Regex/Exact)
                     */
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
                    } else if (text && !text.startsWith('/')) {
                        /**
                         * [PT] Fallback: Inteligência Artificial (AI Bridge)
                         * [EN] Fallback: Artificial Intelligence (AI Bridge)
                         */
                        const scope = cachedSettings?.ai_scope || 'global';
                        const isPrivate = chatType === 'private';
                        const isGroup = chatType === 'group' || chatType === 'supergroup';

                        if (scope === 'private' && !isPrivate) return response;
                        if (scope === 'group' && !isGroup) return response;

                        const userId = body.message.from.id;
                        const lastAICall = aiCooldowns.get(userId) || 0;
                        if (now - lastAICall < 10000) return response;
                        aiCooldowns.set(userId, now);

                        // [PT] Busca contexto histórico para a IA
                        // [EN] Fetch historic context for the AI
                        const [history, automations] = await Promise.all([
                            getChatHistory(chatId),
                            getAllAutomations()
                        ]);

                        const aiResponse = await aiBridge.ask(text, {
                            settings: cachedSettings,
                            history,
                            commands: automations
                        });

                        if (aiResponse) {
                            await sendResponse(chatId, aiResponse);
                            await saveChatMessage(chatId, 'user', text);
                            await saveChatMessage(chatId, 'model', aiResponse);
                        }
                    }
                }
            }
        }

        /**
         * [PT] Evento: Bot adicionado em novo chat
         * [EN] Event: Bot added to a new chat
         */
        if (body.my_chat_member) {
            const chat = body.my_chat_member.chat;
            if (chat.type !== "private") {
                await saveGroup(chat).catch(() => { });
            }
        }

        /**
         * [PT] Handler de Callback (Cliques em botões inline)
         * [EN] Callback Handler (Inline button clicks)
         */
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
                                text: `Please wait ${match.cooldown}s...`,
                                show_alert: false
                            })
                        }).catch(() => { });
                        return response;
                    }
                    commandCooldowns.set(cooldownKey, now);
                }
                await sendResponse(chatId, match.response, match.buttons, match.image_url);
            }
            // [PT] Responde ao Telegram para remover o ícone de carregamento no botão
            // [EN] Answer to Telegram to remove the loading icon on the button
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
    return new Response(null, { status: 404 });
}