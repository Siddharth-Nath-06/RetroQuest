// Level system and cap calculations for RetroQuest

/**
 * Calculate level from total XP using exponential scaling
 * Formula: Level = floor(log((XP / 100) * (multiplier - 1) + 1) / log(multiplier)) + 1
 * Base XP for Level 1 -> 2: 100
 * Multiplier: 1.5
 */
const BASE_XP = 100;
const MULTIPLIER = 1.5;

export const calculateLevel = (xp) => {
    if (xp < 0) return 1;
    // Inverse of the sum of geometric series
    // XP = 100 * (1.5^(level-1) - 1) / (1.5 - 1)
    // XP * 0.5 / 100 = 1.5^(level-1) - 1
    // (XP / 200) + 1 = 1.5^(level-1)
    // log1.5((XP / 200) + 1) = level - 1
    return Math.floor(Math.log((xp / (BASE_XP / (MULTIPLIER - 1))) + 1) / Math.log(MULTIPLIER)) + 1;
};

/**
 * Calculate total XP required to reach a specific level
 */
export const getXPForLevel = (level) => {
    if (level <= 1) return 0;
    // Sum of geometric series: S_n = a(r^n - 1) / (r - 1)
    // Here n = level - 1 (since we start at level 1 with 0 XP)
    return Math.floor(BASE_XP * (Math.pow(MULTIPLIER, level - 1) - 1) / (MULTIPLIER - 1));
};

/**
 * Get detailed stats for the current level
 */
export const getLevelStats = (currentXP) => {
    const level = calculateLevel(currentXP);
    const startXP = getXPForLevel(level);
    const endXP = getXPForLevel(level + 1);

    const levelXP = currentXP - startXP;
    const nextLevelXP = endXP - startXP;
    const progress = (levelXP / nextLevelXP) * 100;

    return {
        level,
        levelXP,
        nextLevelXP,
        progress: Math.min(100, Math.max(0, progress))
    };
};

/**
 * Calculate XP needed for next level (Remaining XP)
 */
export const getXPForNextLevel = (currentXP) => {
    const stats = getLevelStats(currentXP);
    return stats.nextLevelXP - stats.levelXP;
};

/**
 * Get progress percentage to next level
 */
export const getLevelProgress = (currentXP) => {
    return getLevelStats(currentXP).progress;
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
