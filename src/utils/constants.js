// RetroQuest Constants - Templates, Emojis, and Configuration

// Emoji avatars for user profile
export const AVATAR_EMOJIS = ['⚔️', '💀', '🛡️', '🏹', '🔮', '⚡', '🔥', '❄️', '🌟', '💎', '🤖', '🐉', '♥️', '👑', '🪽'];

// Character class options
export const CHARACTER_CLASSES = ['Warrior', 'Mage', 'Rogue', 'Cleric'];

// Character limits
export const QUEST_DESC_MAX = 300;
export const SHOP_DESC_MAX = 200;
export const TITLE_MAX = 50;

// Shop Categories - Real-world rewards
export const SHOP_CATEGORIES = {
  SNACK: 'Snack',
  ENTERTAINMENT: 'Entertainment',
  EXPERIENCE: 'Experience',
  PERSONAL_CARE: 'Personal Care',
  MISC: 'Miscellaneous'
};

export const CATEGORY_ICONS = {
  [SHOP_CATEGORIES.SNACK]: '🍿',
  [SHOP_CATEGORIES.ENTERTAINMENT]: '🎮',
  [SHOP_CATEGORIES.EXPERIENCE]: '🎡',
  [SHOP_CATEGORIES.PERSONAL_CARE]: '💆',
  [SHOP_CATEGORIES.MISC]: '🎁'
};

// Built-in Quest Templates (Real-world focused)
export const BUILT_IN_QUEST_TEMPLATES = [
  {
    id: 'morning-routine',
    type: 'quest',
    name: 'Morning Routine',
    data: {
      title: 'Complete Morning Routine',
      description: 'Start your day right! Exercise for 20 minutes, meditate for 10 minutes, and eat a healthy breakfast.',
      xpReward: 25,
      coinReward: 10,
      tags: ['health', 'daily', 'productivity'],
      deadline: null // Will be set to today at creation
    }
  },
  {
    id: 'study-session',
    type: 'quest',
    name: 'Study Session',
    data: {
      title: 'Focused Study Session',
      description: 'Deep work session: Study or practice your target subject for 2 hours with no distractions. Take 5-minute breaks every 25 minutes.',
      xpReward: 40,
      coinReward: 15,
      tags: ['learning', 'focus', 'skill-building'],
      deadline: null
    }
  },
  {
    id: 'personal-project',
    type: 'quest',
    name: 'Personal Project',
    data: {
      title: 'Work on Personal Project',
      description: 'Dedicate time to your creative or skill-building project. Make meaningful progress - complete at least one task or milestone.',
      xpReward: 50,
      coinReward: 20,
      tags: ['creativity', 'goals', 'project'],
      deadline: null
    }
  }
];

// Built-in Shop Item Templates - Real-world rewards
export const BUILT_IN_SHOP_TEMPLATES = [
  {
    id: 'shop_template_1',
    name: '☕ Coffee & Pastry',
    data: {
      title: 'Coffee & Pastry',
      description: 'Treat yourself to your favorite coffee and a pastry',
      cost: 50,
      category: SHOP_CATEGORIES.SNACK,
      visible: true
    }
  },
  {
    id: 'shop_template_2',
    name: '🎬 Movie Night',
    data: {
      title: 'Movie Night',
      description: 'Stream a new movie or go to the theater',
      cost: 100,
      category: SHOP_CATEGORIES.ENTERTAINMENT,
      visible: true
    }
  },
  {
    id: 'shop_template_3',
    name: '💆 Mini Spa Session',
    data: {
      title: 'Mini Spa Session',
      description: '30-minute massage or facial treatment',
      cost: 200,
      category: SHOP_CATEGORIES.PERSONAL_CARE,
      visible: true
    }
  }
];

// Merge built-in templates
export const BUILT_IN_TEMPLATES = [
  ...BUILT_IN_QUEST_TEMPLATES,
  ...BUILT_IN_SHOP_TEMPLATES
];

// Quest status enum
export const QUEST_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};
