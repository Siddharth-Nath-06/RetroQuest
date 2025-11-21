// AI Service - Dual approach: Chrome Prompt API (primary) + Gemini API (fallback)

import { loadGeminiApiKey } from './storage.js';
import { getMaxQuestXP, getMaxQuestCoins } from './levelSystem.js';

/**
 * Detect if Chrome's built-in Prompt API is available
 */
export const detectAICapability = async () => {
    // Check for window.ai (Chrome Prompt API)
    if (typeof window !== 'undefined' && window.ai) {
        try {
            const canCreateSession = await window.ai.canCreateSession();
            if (canCreateSession === 'readily') {
                return { available: true, type: 'chrome-prompt-api' };
            } else if (canCreateSession === 'after-download') {
                return { available: true, type: 'chrome-prompt-api', requiresDownload: true };
            }
        } catch (error) {
            console.log('Chrome Prompt API not available:', error);
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
const generateWithPromptAPI = async (userMessage, userContext) => {
    try {
        const session = await window.ai.createSession({
            systemPrompt: createSystemPrompt(userContext)
        });

        const response = await session.prompt(userMessage);

        // Parse the JSON response
        const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
        const parsed = JSON.parse(cleanedResponse);

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
    if (capability.type === 'chrome-prompt-api') {
        if (capability.requiresDownload) {
            return {
                success: false,
                error: 'Chrome AI model needs to be downloaded. Please wait for the download to complete.',
                requiresDownload: true
            };
        }
        return await generateWithPromptAPI(userMessage, userContext);
    } else if (capability.type === 'gemini-api') {
        return await generateWithGeminiAPI(userMessage, userContext);
    }

    return {
        success: false,
        error: 'Unknown AI capability type'
    };
};
