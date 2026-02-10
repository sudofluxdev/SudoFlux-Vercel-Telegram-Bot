import { db, getAllLeads, getAllGroups } from "../../../src/lib/db.js";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Cron Log: Checking Tasks ⏰");

    if (!db) {
        console.error("Cron Error: DB Not Initialized (Firebase Admin)");
        return new Response("DB Init Failed", { status: 500 });
    }

    // Fetch Settings for Token
    let token = process.env.TELEGRAM_BOT_TOKEN;
    try {
        const settingsSnap = await db.collection("settings").doc("bot_config").get();
        if (settingsSnap.exists) {
            const s = settingsSnap.data();
            if (s.telegram_token) token = s.telegram_token;
        }
    } catch (e) { }

    if (!token) return new Response("No Token", { status: 200 });

    try {
        const now = new Date();
        // Since we are using Firestore Admin SDK via 'db', we must use its methods
        const snapshot = await db.collection("scheduled_tasks")
            .where("status", "==", "pending")
            .where("scheduled_at", "<=", now)
            .get();

        if (snapshot.empty) {
            console.log("No pending tasks.");
            return new Response("No tasks", { status: 200 });
        }

        console.log(`Cron: Found ${snapshot.size} tasks to execute.`);

        // PRE-FETCH TARGETS
        const userIds = await getAllLeads();
        const groupIds = await getAllGroups();

        for (const taskDoc of snapshot.docs) {
            const task = taskDoc.data();
            const taskId = taskDoc.id;
            console.log(`Executing Task ${taskId} [Scope: ${task.scope}]`);

            // DETERMINE TARGETS
            let targets = [];
            if (task.scope === 'global' || !task.scope) {
                targets = [...userIds, ...groupIds];
            } else if (task.scope === 'private') {
                targets = userIds;
            } else if (task.scope === 'group') {
                targets = groupIds;
            }

            // Target deduction: Filter out duplicates if any
            targets = [...new Set(targets)];

            if (targets.length === 0) {
                console.log(`No targets for task ${taskId}`);
                await db.collection("scheduled_tasks").doc(taskId).update({
                    status: task.frequency === 'once' ? "completed" : "pending",
                    targets_reached: 0,
                    error: "No targets found for scope"
                });
                continue;
            }

            let fileId = null;
            let startIndex = 0;
            let successCount = 0;
            const endpoint = task.image ? 'sendPhoto' : 'sendMessage';

            const commonPayload = {
                parse_mode: "HTML",
                disable_web_page_preview: false
            };

            if (task.buttons && task.buttons.length > 0) {
                const inlineKeyboard = task.buttons.map(btn => ([{
                    text: btn.label,
                    url: btn.url
                }]));
                commonPayload.reply_markup = { inline_keyboard: inlineKeyboard };
            }

            // --- INITIAL UPLOAD (IF BASE64) ---
            if (task.image && task.image.startsWith('data:image')) {
                try {
                    const base64Data = task.image.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const formData = new FormData();
                    const blob = new Blob([buffer], { type: 'image/jpeg' });

                    formData.append('chat_id', targets[0]);
                    formData.append('photo', blob, 'image.jpg');
                    if (task.message) formData.append('caption', task.message);
                    formData.append('parse_mode', 'HTML');
                    if (commonPayload.reply_markup) {
                        formData.append('reply_markup', JSON.stringify(commonPayload.reply_markup));
                    }

                    const uploadRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });

                    const uploadData = await uploadRes.json();
                    if (uploadData.ok) {
                        const photos = uploadData.result.photo;
                        fileId = photos[photos.length - 1].file_id;
                        successCount++;
                        startIndex = 1;
                    } else {
                        console.error(`Upload failed for task ${taskId}:`, uploadData);
                        // Mark as failed to avoid infinite loop
                        await db.collection("scheduled_tasks").doc(taskId).update({
                            status: "error",
                            error: `Telegram Upload Error: ${uploadData.description}`
                        });
                        continue;
                    }
                } catch (err) {
                    console.error(`Buffer error in task ${taskId}:`, err);
                    continue;
                }
            }

            // --- PREPARE FINAL PAYLOAD ---
            const loopPayload = { ...commonPayload };
            if (fileId) {
                loopPayload.photo = fileId;
                loopPayload.caption = task.message;
            } else if (task.image) {
                loopPayload.photo = task.image;
                loopPayload.caption = task.message;
            } else {
                loopPayload.text = task.message;
            }

            // --- SEND LOOP (with small delay to avoid rate limits) ---
            for (let i = startIndex; i < targets.length; i++) {
                const targetId = targets[i];
                try {
                    const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: targetId, ...loopPayload })
                    });
                    if (res.ok) successCount++;

                    // Throttle slightly if many targets
                    if (targets.length > 30) await new Promise(r => setTimeout(r, 50));
                } catch (e) {
                    console.error(`Failed to send to ${targetId}`, e);
                }
            }

            // UPDATE STATUS / RESCHEDULE
            if (task.frequency === 'once' || !task.frequency) {
                await db.collection("scheduled_tasks").doc(taskId).update({
                    status: "completed",
                    executed_at: now,
                    targets_reached: successCount
                });
            } else {
                // RESCHEDULE
                let nextDate = new Date(task.scheduled_at.toDate ? task.scheduled_at.toDate() : task.scheduled_at);

                if (task.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                else if (task.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (task.frequency === 'custom' && task.custom_interval) {
                    nextDate.setMinutes(nextDate.getMinutes() + Number(task.custom_interval));
                }

                // If nextDate is still in the past (e.g. system was down), 
                // move it to the future based on the interval
                while (nextDate <= now) {
                    if (task.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    else if (task.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    else if (task.frequency === 'custom' && task.custom_interval) {
                        nextDate.setMinutes(nextDate.getMinutes() + Number(task.custom_interval));
                    } else {
                        break; // Prevent infinite loop for 'once'
                    }
                }

                await db.collection("scheduled_tasks").doc(taskId).update({
                    scheduled_at: nextDate,
                    last_executed: now,
                    targets_reached: successCount
                });
                console.log(`Rescheduled Task ${taskId} to ${nextDate}`);
            }
        }

        return new Response("Tasks Executed", { status: 200 });
    } catch (err) {
        console.error("Cron Critical Error:", err);
        return new Response("Error: " + err.message, { status: 500 });
    }
}
