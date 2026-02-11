import { getBotSettings, getAllAutomations, saveChatMessage, getChatHistory } from "../../../src/lib/db.js";
import { aiBridge } from "../../../src/lib/ai/index.js";

const TRAINER_ID = "dashboard_trainer";

export async function POST(req) {
    try {
        const { prompt, settings, isTraining } = await req.json();

        // 1. Fetch persistent history (last 15)
        const history = await getChatHistory(TRAINER_ID, 15);

        // 2. Save User message
        await saveChatMessage(TRAINER_ID, "user", prompt);

        const automations = await getAllAutomations();

        // 3. Ask AI
        const response = await aiBridge.ask(prompt, {
            settings,
            history: history, // Use persistent history
            commands: automations,
            isTraining
        });

        // 4. Save AI response
        if (response) {
            await saveChatMessage(TRAINER_ID, "model", response);
        }

        return new Response(JSON.stringify({ response }), { status: 200 });
    } catch (e) {
        console.error("❌ AI Test Route Error:", e.message);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function GET() {
    try {
        const settings = await getBotSettings();
        const history = await getChatHistory(TRAINER_ID, 20);

        return new Response(JSON.stringify({
            ...settings,
            history
        }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
