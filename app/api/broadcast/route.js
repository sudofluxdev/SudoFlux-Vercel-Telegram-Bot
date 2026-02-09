import bot from "../../../src/bot.js";

export async function POST(req) {
    console.log("📨 Recebi um pedido de broadcast!");

    try {
        const body = await req.json();

        // Senha de Admin (Idealmente viria do .env)
        if (body.password !== "admin123") {
            return NextResponse.json({ error: "Senha errada!" }, { status: 401 });
        }

        const leads = await getAllLeads();
        let successCount = 0;

        for (const lead of leads) {
            try {
                await bot.api.sendMessage(lead.chatId, body.text);
                successCount++;
                // Delay de 100ms para evitar rate-limit do Telegram
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
                console.error(`Erro ao enviar para ${lead.chatId}:`, err);
            }
        }

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error("Erro no broadcast:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}