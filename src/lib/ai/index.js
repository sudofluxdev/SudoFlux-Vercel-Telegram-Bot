
/**
 * 🛰️ BotFlux AI Bridge - Orchestrator
 * Central point for AI interactions.
 */

import { GeminiProvider } from "./providers/gemini.provider.js";
import { OpenAIProvider } from "./providers/openai.provider.js";

class AIBridge {
    constructor() {
        this.providers = {
            gemini: new GeminiProvider(process.env.GEMINI_API_KEY),
            openai: new OpenAIProvider(process.env.OPENAI_API_KEY),
        };

        // Auto-detect best provider
        this.defaultProvider = process.env.OPENAI_API_KEY ? "openai" : "gemini";

        if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
            console.warn("🛰️ AI_BRIDGE_WARNING: No AI Provider keys found (GEMINI/OPENAI).");
        }
    }

    async ask(prompt, options = {}) {
        const {
            provider = this.defaultProvider,
            settings = {},
            history = [],
            commands = [],
            isTraining = false
        } = options;

        const ai = this.providers[provider];
        if (!ai) throw new Error(`PROVIDER_NOT_FOUND: ${provider}`);

        try {
            return await ai.generate(prompt, settings, history, commands, isTraining);
        } catch (e) {
            console.error(`🛰️ AI_BRIDGE_FAIL [${provider}]:`, e.message);
            return `❌ AI Bridge Error [${provider}]: ${e.message}`;
        }
    }
}

export const aiBridge = new AIBridge();
