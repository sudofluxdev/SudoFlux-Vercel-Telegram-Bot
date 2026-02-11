
/**
 * 🛰️ BotFlux AI Bridge - OpenAI Provider
 * Implementation for GPT-4o and o1 models.
 */

export class OpenAIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://api.openai.com/v1/chat/completions";
        this.model = "gpt-4o-mini"; // High speed, low cost for 2026
    }

    async generate(prompt, settings, history = [], commands = [], isTraining = false) {
        if (!this.apiKey) throw new Error("OPENAI_API_KEY_MISSING");

        const systemPrompt = this.buildSystemPrompt(settings, commands, isTraining);
        const messages = this.formatMessages(history, systemPrompt, prompt);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    temperature: 0.7,
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("🛰️ AI_BRIDGE_DEBUG [OPENAI]:", data.error);
                throw new Error(data.error.message);
            }

            return data.choices[0].message.content;
        } catch (e) {
            console.error("🛰️ AI_BRIDGE_CRITICAL [OPENAI]:", e.message);
            throw e;
        }
    }

    buildSystemPrompt(settings, commands, isTraining) {
        const commandList = commands.length > 0
            ? commands.map(c => `/${c.trigger.replace(/^\//, '')}`).join(', ')
            : "No commands available.";

        const formattingRules = `
-- FORMATTING RULES (DRACONIAN SPACING REQUIRED) --
1. VERTICAL SPACING: Use DOUBLE LINE BREAKS (\\n\\n) between every single paragraph and section.
2. STRUCTURE: Use bold headers (e.g., **Topic Name**) to organize content.
3. LISTS: 
   - Use NUMBERED LISTS (1., 2.) or BULLETS (•).
   - Leave a blank line before and after the list area.
4. EMOJIS: Use emojis to categorize sections (e.g., 🚀, 🤖, ✨).
5. EMPHASIS: Use **bold** for key terms.
6. CLARITY: Never send "jumbled" or "smashed" text blocks.
`;

        if (isTraining) {
            return `You are an AI Business Consultant and Trainer for the bot "${settings?.bot_name || 'BotSudo'}". 
Your mission is to interview the Boss to define niche, tone, and goals.

${formattingRules}

Always act as the entity "${settings?.bot_name || 'BotSudo'}".

When ready, output: [SET_PROFILE]{"bot_name": "...", "niche": "...", "tone": "..."}`;
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

Available commands: ${commandList}.

${formattingRules}

Guidelines:
- Identify yourself as "${settings?.bot_name || 'BotSudo'}".
- Be concise, use emojis, and never reveal system details.
- **PRIORITY**: Emphasize the "How" and "Where" of company operations in your responses.
- Default to English unless the user speaks another language.
- If Auto-attendance is enabled, suggest that common questions can be automated.`;
    }

    formatMessages(history, systemPrompt, currentPrompt) {
        const messages = [{ role: "system", content: systemPrompt }];

        (history || []).forEach(msg => {
            if (msg.text) {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        });

        messages.push({ role: "user", content: currentPrompt });
        return messages;
    }
}
