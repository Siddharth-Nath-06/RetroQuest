// AI Service - Dual approach: Chrome Prompt API (primary) + Gemini API (fallback)

import { loadGeminiApiKey } from './storage.js';
import { getMaxQuestXP, getMaxQuestCoins } from './levelSystem.js';

/**
 * Detect if Chrome's built-in Prompt API is available
 */
export const detectAICapability = async () => {
    // Check for global LanguageModel API (Newest)
    if (typeof window !== 'undefined' && 'LanguageModel' in window) {
        try {
            // @ts-ignore - LanguageModel is experimental
            const availability = await window.LanguageModel.availability();
            // Check for various positive states based on user feedback and docs
            if (availability === 'readily' || availability === 'available') {
                return { available: true, type: 'chrome-prompt-api' };
            } else if (availability === 'after-download') {
                return { available: true, type: 'chrome-prompt-api', requiresDownload: true };
            }
        } catch (error) {
            console.log('Chrome LanguageModel API check failed:', error);
        }
    }

    // Fallback: Check for window.ai (Legacy/Alternative)
    if (typeof window !== 'undefined' && window.ai) {
        try {
            if (window.ai.languageModel) {
                const availability = await window.ai.languageModel.availability();
                if (availability === 'readily') {
                    return { available: true, type: 'chrome-prompt-api' };
                } else if (availability === 'after-download') {
                    return { available: true, type: 'chrome-prompt-api', requiresDownload: true };
                }
            } else if (window.ai.canCreateSession) {
                const canCreateSession = await window.ai.canCreateSession();
                if (canCreateSession === 'readily') {
                    return { available: true, type: 'chrome-prompt-api-legacy' };
                } else if (canCreateSession === 'after-download') {
                    return { available: true, type: 'chrome-prompt-api-legacy', requiresDownload: true };
                }
            }
        } catch (error) {
            console.log('Legacy window.ai check failed:', error);
        }
    }

    // Check if Gemini API key is configured
    const apiKey = loadGeminiApiKey();
    if (apiKey && apiKey.trim() !== '') {
        return { available: true, type: 'gemini-api' };
    }

    return { available: false, type: null };
};

/**
 * Create system prompt for quest generation
 */
const createSystemPrompt = (userContext) => {
    const { level, maxQuestXP, maxQuestCoins } = userContext;

    return `You are a helpful RPG quest master assistant for RetroQuest, a gamified to-do app. 
Your role is to help users turn their REAL-WORLD goals and tasks into engaging quests.

USER CONTEXT:
- Current Level: ${level}
- Max XP per quest: ${maxQuestXP}
- Max Coins per quest: ${maxQuestCoins}

GUIDELINES:
1. Create quests based on real-life tasks the user wants to accomplish
2. XP rewards should reflect difficulty (harder tasks = more XP, but stay within cap)
3. Coin rewards typically 30-50% of XP value
4. Suggest realistic deadlines based on task complexity
5. Add relevant tags for organization
6. Use encouraging, RPG-themed language
7. For complex goals, break them into a QUEST CHAIN (multiple related quests)

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "quests": [
    {
      "title": "Quest title here",
      "description": "Detailed description of what needs to be done",
      "xpReward": 25,
      "coinReward": 10,
      "tags": ["tag1", "tag2"],
      "deadline": "2024-11-21" (YYYY-MM-DD format or null)
    }
  ]
}

IMPORTANT: Ensure XP <= ${maxQuestXP} and Coins <= ${maxQuestCoins}`;
};

/**
 * Generate quests using Chrome Prompt API
 */
const generateWithPromptAPI = async (userMessage, userContext, apiType = 'chrome-prompt-api') => {
    try {
        let session;
        const systemPromptText = createSystemPrompt(userContext);

        if (apiType === 'chrome-prompt-api') {
            // Try global LanguageModel first
            if ('LanguageModel' in window) {
                // @ts-ignore
                session = await window.LanguageModel.create({
                    initialPrompts: [
                        { role: 'system', content: systemPromptText }
                    ]
                });
            } else if (window.ai?.languageModel) {
                // Fallback to window.ai.languageModel
                session = await window.ai.languageModel.create({
                    initialPrompts: [
                        { role: 'system', content: systemPromptText }
                    ]
                });
            }
        } else {
            // Legacy API (window.ai.createSession)
            session = await window.ai.createSession({
                systemPrompt: systemPromptText
            });
        }

        if (!session) {
            throw new Error('Failed to create AI session');
        }

        const response = await session.prompt(userMessage);

        // Parse the JSON response
        const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
        const parsed = JSON.parse(cleanedResponse);

        // Clean up session if destroy method exists
        if (session.destroy) {
            session.destroy();
        }

        return {
            success: true,
            quests: parsed.quests || [],
            source: 'chrome-ai'
        };
    } catch (error) {
        console.error('Prompt API error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate quests with Chrome AI'
        };
    }
};

/**
 * Generate quests using Gemini API
 */
const generateWithGeminiAPI = async (userMessage, userContext) => {
    const apiKey = loadGeminiApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: 'Gemini API key not configured'
        };
    }

    try {
        const systemPrompt = createSystemPrompt(userContext);
        const fullPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userMessage}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini API');
        }

        // Parse the JSON response
        const cleanedResponse = text.trim().replace(/```json\n?|\n?```/g, '');
        const parsed = JSON.parse(cleanedResponse);

        return {
            success: true,
            quests: parsed.quests || [],
            source: 'gemini-api'
        };
    } catch (error) {
        console.error('Gemini API error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate quests with Gemini API'
        };
    }
};

/**
 * Main function to generate quests from user prompt
 * Automatically uses the best available AI method
 */
export const generateQuestsFromPrompt = async (userMessage, userProfile) => {
    // Prepare user context
    const level = Math.floor(userProfile.xp / 100) + 1;
    const userContext = {
        level,
        maxQuestXP: getMaxQuestXP(level),
        maxQuestCoins: getMaxQuestCoins(level)
    };

    // Detect available AI capability
    const capability = await detectAICapability();

    if (!capability.available) {
        return {
            success: false,
            error: 'No AI service available. Please configure Gemini API key or enable Chrome Prompt API.'
        };
    }

    // Use appropriate AI method
    if (capability.type === 'chrome-prompt-api' || capability.type === 'chrome-prompt-api-legacy') {
        if (capability.requiresDownload) {
            return {
                success: false,
                error: 'Chrome AI model needs to be downloaded. Please wait for the download to complete.',
                requiresDownload: true
            };
        }
        return await generateWithPromptAPI(userMessage, userContext, capability.type);
    } else if (capability.type === 'gemini-api') {
        return await generateWithGeminiAPI(userMessage, userContext);
    }

    return {
        success: false,
        error: 'Unknown AI capability type'
    };
};
