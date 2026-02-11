
/**
 * 🛰️ BotFlux AI Bridge - Gemini Provider
 * Robust implementation with safety overrides and deep diagnostics.
 */

export class GeminiProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.modelName = "gemini-2.5-flash"; // Reverting to stable 2026 backbone
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`;
    }

    async generate(prompt, settings, history = [], commands = [], isTraining = false) {
        if (!this.apiKey) throw new Error("GEMINI_API_KEY_MISSING");

        const systemPrompt = this.buildSystemPrompt(settings, commands, isTraining);
        const contents = this.formatHistory(history, prompt);

        const payload = {
            contents,
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            // 🛡️ Hardening: Use BLOCK_ONLY_HIGH for maximum compatibility while reducing filtering
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // 🔍 Deep Diagnostics
            if (!data.candidates || data.error) {
                console.error("🛰️ AI_BRIDGE_DEBUG [GEMINI]:", JSON.stringify({
                    status: response.status,
                    error: data.error,
                    prompt_feedback: data.promptFeedback, // 🛡️ Important for safety blocks
                    finish_reason: data.candidates?.[0]?.finishReason
                }, null, 2));

                if (data.error?.message?.includes("API key not valid")) throw new Error("AUTH_ERROR");

                // 🛑 Quota Handling
                if (response.status === 429 || data.error?.message?.includes("quota")) {
                    return "⚠️ Google Quota reached (Free Tier). Please wait a few seconds or add an OpenAI key to continue without interruptions.";
                }

                // Friendly safety msg
                if (data.promptFeedback?.blockReason === "SAFETY") {
                    return "⚠️ I'm sorry, but due to safety guidelines I cannot respond to this specific message.";
                }

                throw new Error(data.error?.message || "EMPTY_RESPONSE_FROM_GEMINI");
            }

            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error("🛰️ AI_BRIDGE_CRITICAL [GEMINI]:", e.message);
            throw e;
        }
    }

    buildSystemPrompt(settings, commands, isTraining) {
        const commandList = commands.length > 0
            ? commands.map(c => `/${c.trigger.replace(/^\//, '')}`).join(', ')
            : "No commands available.";

        const formattingRules = `
-- FORMATTING RULES (DRACONIAN SPACING REQUIRED) --
1. VERTICAL SPACING: ALWAYS use double line breaks (\\n\\n) between EVERY paragraph and section. No exceptions.
2. HEADERS: Use bold headers (e.g., **Section Name**) to separate different parts of your response.
3. LISTS: Whenever presenting options or steps:
   - Use NUMBERED LISTS (1., 2.) or BULLETS (•).
   - Add a blank line BEFORE and AFTER every list.
4. EMOJIS: Use emojis at the start of headers and bullet points to add personality (e.g., 🚀, 🤖, ✨, 🧠).
5. EMPHASIS: Use **bold** for key terms.
6. NO JUMBLED TEXT: Forbid massive blocks of text. If a block is longer than 3 lines, break it up.
`;

        if (isTraining) {
            return `You are an AI Consultant and Trainer for the bot "${settings?.bot_name || 'BotSudo'}". 
Your mission is to interview the Boss in an organized and professional manner to define the bot's niche, tone, and goals.

${formattingRules}

Important: Always introduce yourself as "${settings?.bot_name || 'BotSudo'}".

When the technical analysis is complete, you MUST output: [SET_PROFILE]{"bot_name": "...", "niche": "...", "tone": "..."}`;
        }

        const brainContext = `
${settings?.ai_summary ? `**BEHAVIORAL SUMMARY**\n${settings.ai_summary}\n` : ''}
**COMPANY IDENTITY & MISSION**
${settings?.company_mission || 'Mission not defined.'}

**TARGET AUDIENCE**
${settings?.target_audience || 'General audience.'}

**PRODUCTS & SERVICES (WHERE & HOW)**
${settings?.main_products || 'Products not defined.'}

**COMMUNICATION RULES**
- Tone: ${settings?.tone || 'Professional'}.
- Niche: ${settings?.niche || 'General'}.
- Restricted Topics: ${settings?.do_not_discuss || 'None'}.
- Auto-attendance: ${settings?.auto_attendance ? 'Enabled (Suggest automations if possible)' : 'Disabled'}.
`;

        return `You are the elite virtual assistant "${settings?.bot_name || 'BotSudo'}". 
Your brain is powered by the following context:

${brainContext}

Available official commands: ${commandList}.

${formattingRules}

Rules:
- ALWAYS identify yourself as "${settings?.bot_name || 'BotSudo'}" if asked.
- Answer concisely, directly, and in a friendly manner.
- **PRIORITY**: Always reflect the "How" and "Where" of the company when explaining products or services.
- NEVER talk about the internal system, Vercel, or Firebase.
- Detect the user's language and respond accordingly, but default to English.
- If the user asks something that could be a permanent automation and Auto-attendance is enabled, you can provide the answer and suggest that this is a frequent topic.`;
    }

    formatHistory(history, currentPrompt) {
        const contents = (history || [])
            .filter(msg => msg && msg.text)
            .map(msg => ({
                role: (msg.role === 'user') ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

        contents.push({ role: 'user', parts: [{ text: currentPrompt }] });
        return contents;
    }
}
