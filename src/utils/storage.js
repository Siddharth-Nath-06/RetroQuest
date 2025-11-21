// LocalStorage persistence layer for RetroQuest

const STORAGE_KEYS = {
    USER_PROFILE: 'retroquest_user_profile',
    QUESTS: 'retroquest_quests',
    SHOP_ITEMS: 'retroquest_shop_items',
    PURCHASE_HISTORY: 'retroquest_purchase_history',
    TEMPLATES: 'retroquest_templates',
    GEMINI_API_KEY: 'retroquest_gemini_api_key',
    AI_METHOD_PREFERENCE: 'retroquest_ai_method_preference'
};

// Default user profile
const DEFAULT_PROFILE = {
    displayName: 'Adventurer',
    class: 'Warrior',
    avatar: '⚔️',
    xp: 0,
    coins: 0,
    questsCompleted: 0,
    totalXPGained: 0
};

// User Profile
export const saveUserProfile = (profile) => {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        return false;
    }
};

export const loadUserProfile = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return DEFAULT_PROFILE;
    }
};

// Quests
export const saveQuests = (quests) => {
    try {
        localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
        return true;
    } catch (error) {
        console.error('Error saving quests:', error);
        return false;
    }
};

export const loadQuests = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.QUESTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading quests:', error);
        return [];
    }
};

// Shop Items
export const saveShopItems = (items) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving shop items:', error);
        return false;
    }
};

export const loadShopItems = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading shop items:', error);
        return [];
    }
};

// Templates (user-created + built-in merged)
export const saveTemplates = (templates) => {
    try {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        return true;
    } catch (error) {
        console.error('Error saving templates:', error);
        return false;
    }
};

export const loadTemplates = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading templates:', error);
        return [];
    }
};

// Gemini API Key
export const saveGeminiApiKey = (apiKey) => {
    try {
        localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, apiKey);
        return true;
    } catch (error) {
        console.error('Error saving API key:', error);
        return false;
    }
};

export const loadGeminiApiKey = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
    } catch (error) {
        console.error('Error loading API key:', error);
        return '';
    }
};

// AI Method Preference
export const saveAiMethodPreference = (method) => {
    try {
        localStorage.setItem(STORAGE_KEYS.AI_METHOD_PREFERENCE, method);
        return true;
    } catch (error) {
        console.error('Error saving AI method preference:', error);
        return false;
    }
};

export const loadAiMethodPreference = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.AI_METHOD_PREFERENCE) || null;
    } catch (error) {
        console.error('Error loading AI method preference:', error);
        return null;
    }
};

// Purchase History
export const savePurchaseHistory = (history) => {
    try {
        localStorage.setItem(STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(history));
        return true;
    } catch (error) {
        console.error('Error saving purchase history:', error);
        return false;
    }
};

export const loadPurchaseHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading purchase history:', error);
        return [];
    }
};

export const addPurchaseToHistory = (purchase) => {
    try {
        const history = loadPurchaseHistory();
        history.unshift(purchase); // Add to beginning
        savePurchaseHistory(history);
        return true;
    } catch (error) {
        console.error('Error adding purchase to history:', error);
        return false;
    }
};

// Clear all data (for reset functionality)
export const clearAllData = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
};

// Data Management Functions

export const exportData = () => {
    try {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([keyName, storageKey]) => {
            const item = localStorage.getItem(storageKey);
            if (item) {
                try {
                    data[keyName] = JSON.parse(item);
                } catch (e) {
                    // If not JSON (like API key), save as string
                    data[keyName] = item;
                }
            }
        });
        return data;
    } catch (error) {
        console.error('Error exporting data:', error);
        return null;
    }
};

export const importData = (jsonData) => {
    try {
        // Basic validation
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Invalid data format');
        }

        Object.entries(jsonData).forEach(([keyName, value]) => {
            if (STORAGE_KEYS[keyName]) {
                const storageKey = STORAGE_KEYS[keyName];
                if (typeof value === 'string') {
                    localStorage.setItem(storageKey, value);
                } else {
                    localStorage.setItem(storageKey, JSON.stringify(value));
                }
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error importing data:', error);
        return { success: false, error: error.message };
    }
};

export const wipeData = (keysToWipe) => {
    try {
        keysToWipe.forEach(keyName => {
            if (STORAGE_KEYS[keyName]) {
                localStorage.removeItem(STORAGE_KEYS[keyName]);
            }
        });
        return true;
    } catch (error) {
        console.error('Error wiping data:', error);
        return false;
    }
};

export { STORAGE_KEYS };
