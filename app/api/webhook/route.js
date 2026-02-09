import { webhookCallback } from "grammy";
import bot from "../../../src/bot.js";
import { saveUser } from "../../../src/lib/db.js";
import { getFirestore } from "firebase-admin/firestore";

// Removida inicialização duplicada e verificação manual de token que quebrava o build
// O bot já é inicializado de forma segura em src/bot.js

// Captura o lead ao dar /start
bot.command("start", async (ctx) => {
    await saveUser(ctx.from);
    await ctx.reply("Fala piá! O SudoFlux Bot tá on e roteando! 🚀\n\nSeu contato foi salvo para novidades!");
});

// Handler dinâmico de mensagens e comandos
bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.toLowerCase();

    // Buscar comandos customizados no Firestore
    const db = getFirestore();
    const cmdSnap = await db.collection("commands").where("command", "==", text).get();

    if (!cmdSnap.empty) {
        const cmdData = cmdSnap.docs[0].data();
        return await ctx.reply(cmdData.response);
    }

    if (text === "/status") {
        return await ctx.reply("O sistema está operacional! ✅");
    }

    await ctx.reply("Recebi sua mensagem! Use /start para se cadastrar se ainda não o fez.");
});

// Configuração para o Next.js (Não mexa aqui)
export const POST = webhookCallback(bot, "std/http");