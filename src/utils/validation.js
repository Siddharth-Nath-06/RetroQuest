// Validation utilities for quest and shop item forms

import { QUEST_DESC_MAX, SHOP_DESC_MAX, TITLE_MAX } from './constants.js';
import { validateQuestRewards } from './levelSystem.js';

/**
 * Validate quest form data
 * Returns object with { valid: boolean, errors: object }
 */
export const validateQuestForm = (data, userLevel) => {
    const errors = {};

    // Title validation
    if (!data.title || data.title.trim() === '') {
        errors.title = 'Title is required';
    } else if (data.title.length > TITLE_MAX) {
        errors.title = `Title must be ${TITLE_MAX} characters or less`;
    }

    // Description validation
    if (!data.description || data.description.trim() === '') {
        errors.description = 'Description is required';
    } else if (data.description.length > QUEST_DESC_MAX) {
        errors.description = `Description must be ${QUEST_DESC_MAX} characters or less`;
    }

    // XP and coin validation
    const xpReward = parseInt(data.xpReward);
    const coinReward = parseInt(data.coinReward);

    if (isNaN(xpReward) || xpReward < 0) {
        errors.xpReward = 'XP reward must be a positive number';
    }

    if (isNaN(coinReward) || coinReward < 0) {
        errors.coinReward = 'Coin reward must be a positive number';
    }

    // Level cap validation
    if (!errors.xpReward && !errors.coinReward) {
        const rewardErrors = validateQuestRewards(xpReward, coinReward, userLevel);
        if (rewardErrors.length > 0) {
            errors.rewards = rewardErrors.join('. ');
        }
    }

    // Deadline validation
    if (data.deadline) {
        const deadlineDate = new Date(data.deadline);
        if (isNaN(deadlineDate.getTime())) {
            errors.deadline = 'Invalid deadline date';
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate shop item form data
 * Returns object with { valid: boolean, errors: object }
 */
export const validateShopItemForm = (data) => {
    const errors = {};

    // Title validation
    if (!data.title || data.title.trim() === '') {
        errors.title = 'Title is required';
    } else if (data.title.length > TITLE_MAX) {
        errors.title = `Title must be ${TITLE_MAX} characters or less`;
    }

    // Description validation
    if (!data.description || data.description.trim() === '') {
        errors.description = 'Description is required';
    } else if (data.description.length > SHOP_DESC_MAX) {
        errors.description = `Description must be ${SHOP_DESC_MAX} characters or less`;
    }

    // Cost validation
    const cost = parseInt(data.cost);
    if (isNaN(cost) || cost < 0) {
        errors.cost = 'Cost must be a positive number';
    }

    // Category validation
    if (!data.category || data.category.trim() === '') {
        errors.category = 'Category is required';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
