export const adminOnly = async (ctx, next) => {
    const adminId = process.env.ADMIN_CHAT_ID;
    const userId = ctx.from?.id.toString();

    if (userId === adminId) {
        return await next();
    }

    return ctx.reply("❌ Acesso negado. Apenas administradores podem executar este comando.");
};
