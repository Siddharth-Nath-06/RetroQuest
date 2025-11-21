// Level system and cap calculations for RetroQuest

/**
 * Calculate level from total XP
 * Formula: level = floor(xp / 100) + 1
 */
export const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1;
};

/**
 * Calculate XP needed for next level
 */
export const getXPForNextLevel = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    const nextLevelXP = (currentLevel) * 100;
    return nextLevelXP - currentXP;
};

/**
 * Get progress percentage to next level
 */
export const getLevelProgress = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    const prevLevelXP = (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * 100;
    const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
    return Math.min(100, Math.max(0, progress));
};

/**
 * Get maximum XP reward allowed for a quest at given level
 * Formula: level * 50
 */
export const getMaxQuestXP = (level) => {
    return level * 50;
};

/**
 * Get maximum coin reward allowed for a quest at given level
 * Formula: level * 20
 */
export const getMaxQuestCoins = (level) => {
    return level * 20;
};

/**
 * Get global XP cap based on level
 * Formula: level * 1000
 */
export const getGlobalXPCap = (level) => {
    return level * 1000;
};

/**
 * Get global coin cap based on level
 * Formula: level * 500
 */
export const getGlobalCoinCap = (level) => {
    return level * 500;
};

/**
 * Validate quest rewards against level caps
 * Returns array of error messages, empty if valid
 */
export const validateQuestRewards = (xpReward, coinReward, level) => {
    const errors = [];

    const maxXP = getMaxQuestXP(level);
    const maxCoins = getMaxQuestCoins(level);

    if (xpReward > maxXP) {
        errors.push(`XP reward (${xpReward}) exceeds maximum for level ${level} (${maxXP} XP)`);
    }

    if (coinReward > maxCoins) {
        errors.push(`Coin reward (${coinReward}) exceeds maximum for level ${level} (${maxCoins} coins)`);
    }

    if (xpReward < 0) {
        errors.push('XP reward cannot be negative');
    }

    if (coinReward < 0) {
        errors.push('Coin reward cannot be negative');
    }

    return errors;
};

/**
 * Check if adding XP/coins would exceed global caps
 * Returns object with { exceeds: boolean, type: 'xp'|'coins'|null, newValue, cap }
 */
export const checkGlobalCapExceeded = (currentXP, currentCoins, addXP, addCoins, level) => {
    const xpCap = getGlobalXPCap(level);
    const coinCap = getGlobalCoinCap(level);

    const newXP = currentXP + addXP;
    const newCoins = currentCoins + addCoins;

    if (newXP > xpCap) {
        return {
            exceeds: true,
            type: 'xp',
            newValue: newXP,
            cap: xpCap,
            message: `Adding ${addXP} XP would exceed the global cap (${xpCap} XP for level ${level}). Continue anyway?`
        };
    }

    if (newCoins > coinCap) {
        return {
            exceeds: true,
            type: 'coins',
            newValue: newCoins,
            cap: coinCap,
            message: `Adding ${addCoins} coins would exceed the global cap (${coinCap} coins for level ${level}). Continue anyway?`
        };
    }

    return { exceeds: false };
};
