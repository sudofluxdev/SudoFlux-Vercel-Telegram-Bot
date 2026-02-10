import { db, getAllLeads, getAllGroups } from "../../../src/lib/db.js";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Cron Log: Checking Tasks ⏰");

    if (!db) return new Response("DB Init Failed", { status: 500 });

    // Fetch Settings
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
        const tasksRef = collection(db, "scheduled_tasks");
        const q = query(tasksRef, where("status", "==", "pending"), where("scheduled_at", "<=", now));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No pending tasks.");
            return new Response("No tasks", { status: 200 });
        }

        // PRE-FETCH TARGETS
        const userIds = await getAllLeads();
        const groupIds = await getAllGroups();

        for (const taskDoc of snapshot.docs) {
            const task = taskDoc.data();
            console.log(`Executing Task ${taskDoc.id} [Scope: ${task.scope}]`);

            // DETERMINE TARGETS
            let targets = [];
            if (task.scope === 'global' || !task.scope) {
                targets = [...userIds, ...groupIds];
            } else if (task.scope === 'private') {
                targets = userIds;
            } else if (task.scope === 'group') {
                targets = groupIds;
            }

            // --- TARGET CHECK ---
            if (targets.length === 0) {
                console.log(`No targets for task ${taskDoc.id}`);
                await updateDoc(doc(db, "scheduled_tasks", taskDoc.id), {
                    status: task.frequency === 'once' ? "completed" : "pending",
                    targets_reached: 0
                });
                continue;
            }

            let fileId = null;
            let startIndex = 0;
            let successCount = 0;
            let endpoint = task.image ? 'sendPhoto' : 'sendMessage';

            // Common Payload
            const commonPayload = {
                parse_mode: "HTML",
                disable_web_page_preview: false
            };

            // Buttons
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
                        console.error(`Upload failed for task ${taskDoc.id}:`, uploadData);
                        // Mark as failed so it doesn't loop infinitely?
                        continue;
                    }
                } catch (err) {
                    console.error(`Buffer error in task ${taskDoc.id}:`, err);
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

            // --- SEND LOOP ---
            for (let i = startIndex; i < targets.length; i++) {
                const targetId = targets[i];
                try {
                    const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: targetId, ...loopPayload })
                    });
                    if (res.ok) successCount++;
                } catch (e) {
                    console.error(`Failed to send to ${targetId}`, e);
                }
            }

            // UPDATE STATUS / RESCHEDULE
            if (task.frequency === 'once' || !task.frequency) {
                await updateDoc(doc(db, "scheduled_tasks", taskDoc.id), {
                    status: "completed",
                    executed_at: now,
                    targets_reached: successCount
                });
            } else {
                // RESCHEDULE
                let nextDate = new Date(task.scheduled_at.toDate());
                if (task.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                if (task.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);

                await updateDoc(doc(db, "scheduled_tasks", taskDoc.id), {
                    scheduled_at: nextDate,
                    last_executed: now,
                    targets_reached: successCount
                });
                console.log(`Rescheduled Task ${taskDoc.id} to ${nextDate}`);
            }
        }

        return new Response("Tasks Executed", { status: 200 });
    } catch (err) {
        console.error("Cron Error:", err);
        return new Response("Error", { status: 500 });
    }
}
