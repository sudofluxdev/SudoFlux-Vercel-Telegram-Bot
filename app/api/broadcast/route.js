import { NextResponse } from "next/server";
import { getAllLeads, getAllGroups } from "../../../src/lib/db.js";

// We use the Telegram Bot API directly via fetch to avoid 'grammy' instance issues in serverless
// and because we just need simple send methods.

export async function POST(req) {
    try {
        const body = await req.json();

        // Security Check
        if (body.password !== "admin123") {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        if (!body.text && !body.image) {
            return NextResponse.json({ error: "Empty message" }, { status: 400 });
        }

        // --- DETERMINE TARGETS ---
        let targets = [];
        const userIds = await getAllLeads();
        const groupIds = await getAllGroups();

        if (body.scope === 'global' || !body.scope) {
            targets = [...userIds, ...groupIds];
        } else if (body.scope === 'private') {
            targets = userIds;
        } else if (body.scope === 'group') {
            targets = groupIds;
        }

        console.log(`📨 Broadcast [${body.scope}] to ${targets.length} targets.`);

        // --- PREPARE PAYLOAD ---
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return NextResponse.json({ error: "No Bot Token" }, { status: 500 });

        if (targets.length === 0) {
            return NextResponse.json({ success: true, count: 0, failed: 0 });
        }

        let fileId = null;
        let successCount = 0;
        let failCount = 0;
        let startIndex = 0;
        let endpoint = body.image ? 'sendPhoto' : 'sendMessage';

        const commonPayload = {
            parse_mode: "HTML",
            disable_web_page_preview: false
        };

        // Handle Buttons (common for all)
        if (body.buttons && body.buttons.length > 0) {
            const inlineKeyboard = body.buttons.map(btn => ([{
                text: btn.label,
                url: btn.url
            }]));
            commonPayload.reply_markup = { inline_keyboard: inlineKeyboard };
        }

        // --- INITIAL UPLOAD (IF BASE64) ---
        if (body.image && body.image.startsWith('data:image')) {
            try {
                const base64Data = body.image.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const formData = new FormData();

                // Construct multipart form for the FIRST target
                const blob = new Blob([buffer], { type: 'image/jpeg' });
                formData.append('chat_id', targets[0]);
                formData.append('photo', blob, 'image.jpg');
                if (body.text) formData.append('caption', body.text);
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
                    // Extract file_id from the response to reuse it
                    const photos = uploadData.result.photo;
                    fileId = photos[photos.length - 1].file_id;
                    successCount++;
                    startIndex = 1; // Skip first target in the loop below
                } else {
                    console.error("Initial Upload Failed:", uploadData);
                    return NextResponse.json({ error: "Upload failed: " + uploadData.description }, { status: 400 });
                }
            } catch (err) {
                console.error("Buffer error:", err);
                return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
            }
        }

        // --- PREPARE FINAL PAYLOAD FOR LOOP ---
        const loopPayload = { ...commonPayload };
        if (fileId) {
            loopPayload.photo = fileId;
            loopPayload.caption = body.text;
        } else if (body.image) {
            loopPayload.photo = body.image;
            loopPayload.caption = body.text;
        } else {
            loopPayload.text = body.text;
        }

        // --- SEND LOOP ---
        for (let i = startIndex; i < targets.length; i++) {
            const chatId = targets[i];
            try {
                const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, ...loopPayload })
                });

                if (res.ok) successCount++;
                else failCount++;

            } catch (err) {
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            failed: failCount
        });

    } catch (error) {
        console.error("Critical Broadcast Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}