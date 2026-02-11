
import { db } from "../../../src/lib/db.js";

export async function POST(req) {
    try {
        const {
            bot_name, niche, tone,
            company_mission, target_audience, main_products,
            do_not_discuss, auto_attendance,
            ai_scope, ai_summary
        } = await req.json();

        if (!db) throw new Error("Database not connected");

        await db.collection("settings").doc("bot_config").set({
            bot_name,
            niche,
            tone,
            company_mission: company_mission || "",
            target_audience: target_audience || "",
            main_products: main_products || "",
            do_not_discuss: do_not_discuss || "",
            auto_attendance: auto_attendance !== undefined ? auto_attendance : true,
            ai_scope: ai_scope || 'global',
            ai_summary: ai_summary || ""
        }, { merge: true });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
