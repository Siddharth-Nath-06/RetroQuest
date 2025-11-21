import React, { useState } from 'react';
import './QuestLog.css';
import { QUEST_STATUS, BUILT_IN_QUEST_TEMPLATES } from '../utils/constants';
import { validateQuestForm } from '../utils/validation';
import { calculateLevel, checkGlobalCapExceeded } from '../utils/levelSystem';
import { useDebounce } from '../hooks/useDebounce';
import ConfirmModal from './ConfirmModal';

const QuestLog = ({ quests, userProfile, onAddQuest, onUpdateQuest, onDeleteQuest, setUserProfile }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingQuest, setEditingQuest] = useState(null);
    const [selectedTag, setSelectedTag] = useState(''); // For filtering by tag
    const [sortBy, setSortBy] = useState('none'); // 'none', 'title', 'deadline'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        xpReward: '',
        coinReward: '',
        deadline: '',
        tags: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, quest: null });

    const level = calculateLevel(userProfile.xp);

    const { debouncedCallback } = useDebounce((quest) => {
        completeQuestAction(quest);
    }, 500);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const questData = {
            ...formData,
            xpReward: parseInt(formData.xpReward) || 0,
            coinReward: parseInt(formData.coinReward) || 0,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        };

        const validation = validateQuestForm(questData, level);

        if (!validation.valid) {
            setFormErrors(validation.errors);
            return;
        }

        if (editingQuest) {
            onUpdateQuest({ ...editingQuest, ...questData });
        } else {
            onAddQuest(questData);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', xpReward: '', coinReward: '', deadline: '', tags: '' });
        setFormErrors({});
        setShowForm(false);
        setEditingQuest(null);
    };

    const applyTemplate = (template) => {
        setFormData({
            title: template.data.title,
            description: template.data.description,
            xpReward: template.data.xpReward.toString(),
            coinReward: template.data.coinReward.toString(),
            deadline: template.data.deadline || '',
            tags: template.data.tags.join(', ')
        });
    };

    const completeQuestAction = (quest) => {
        const capCheck = checkGlobalCapExceeded(
            userProfile.xp,
            userProfile.coins,
            quest.xpReward,
            quest.coinReward,
            level
        );

        if (capCheck.exceeds) {
            if (!window.confirm(capCheck.message)) {
                return;
            }
        }

        onUpdateQuest({ ...quest, status: QUEST_STATUS.COMPLETED, completedAt: new Date().toISOString() });
        setUserProfile({
            ...userProfile,
            xp: userProfile.xp + quest.xpReward,
            coins: userProfile.coins + quest.coinReward,
            questsCompleted: (userProfile.questsCompleted || 0) + 1,
            totalXPGained: (userProfile.totalXPGained || 0) + quest.xpReward
        });
    };

    const handleCompleteQuest = (quest) => {
        debouncedCallback(quest);
    };

    const handleEditQuest = (quest) => {
        setEditingQuest(quest);
        setFormData({
            title: quest.title,
            description: quest.description,
            xpReward: quest.xpReward.toString(),
            coinReward: quest.coinReward.toString(),
            deadline: quest.deadline || '',
            tags: quest.tags.join(', ')
        });
        setShowForm(true);
    };

    const handleArchiveQuest = (quest) => {
        onUpdateQuest({ ...quest, status: QUEST_STATUS.ARCHIVED });
    };

    const handleReviveQuest = (quest) => {
        onUpdateQuest({ ...quest, status: QUEST_STATUS.ACTIVE });
    };

    const handleDeleteQuest = (quest) => {
        setConfirmModal({
            show: true,
            action: () => {
                onDeleteQuest(quest.id);
                setConfirmModal({ show: false, action: null, quest: null });
            },
            quest
        });
    };

    // Get all unique tags from all quests
    const allTags = [...new Set(quests.flatMap(q => q.tags || []))];

    // Apply filtering and sorting
    let processedQuests = [...quests];

    // Filter by tag if selected
    if (selectedTag) {
        processedQuests = processedQuests.filter(q => q.tags?.includes(selectedTag));
    }

    // Sort quests
    if (sortBy === 'title') {
        processedQuests.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'deadline') {
        processedQuests.sort((a, b) => {
            if (!a.deadline) return 1; // No deadline goes to end
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
    }

    const activeQuests = processedQuests.filter(q => q.status === QUEST_STATUS.ACTIVE);
    const completedQuests = processedQuests.filter(q => q.status === QUEST_STATUS.COMPLETED);
    const archivedQuests = processedQuests.filter(q => q.status === QUEST_STATUS.ARCHIVED);

    return (
        <div className="quest-log-container">
            <div className="panel">
                <div className="panel-header">
                    <h2>📜 Quest Log</h2>
                    <div className="header-controls">
                        <div className="filter-sort-controls">
                            <div className="filter-controls">
                                <label>Filter by tag:</label>
                                <select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">All Tags</option>
                                    {allTags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sort-controls">
                                <label>Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="sort-select"
                                >
                                    <option value="none">None</option>
                                    <option value="title">Title (A-Z)</option>
                                    <option value="deadline">Deadline (Earliest)</option>
                                </select>
                            </div>
                            {(selectedTag || sortBy !== 'none') && (
                                <button
                                    className="btn btn-sm"
                                    onClick={() => {
                                        setSelectedTag('');
                                        setSortBy('none');
                                    }}
                                    title="Clear filters"
                                >
                                    ✖ Clear
                                </button>
                            )}
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ New Quest'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <form className="quest-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                                {formErrors.title && <div className="error-message">{formErrors.title}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                            {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>XP Reward</label>
                                <input
                                    type="number"
                                    name="xpReward"
                                    value={formData.xpReward}
                                    onChange={handleInputChange}
                                />
                                {formErrors.xpReward && <div className="error-message">{formErrors.xpReward}</div>}
                            </div>
                            <div className="form-group">
                                <label>Coin Reward</label>
                                <input
                                    type="number"
                                    name="coinReward"
                                    value={formData.coinReward}
                                    onChange={handleInputChange}
                                />
                                {formErrors.coinReward && <div className="error-message">{formErrors.coinReward}</div>}
                            </div>
                            <div className="form-group">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tags (comma-separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g., work, health, learning"
                            />
                        </div>

                        {formErrors.rewards && <div className="error-message">{formErrors.rewards}</div>}

                        <div className="template-section">
                            <label>Quick Start Templates:</label>
                            <div className="template-buttons">
                                {BUILT_IN_QUEST_TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() => applyTemplate(template)}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-success">
                                {editingQuest ? 'Update Quest' : 'Create Quest'}
                            </button>
                            <button type="button" className="btn" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="quests-sections">
                <QuestSection
                    title="Active Quests"
                    quests={activeQuests}
                    onComplete={handleCompleteQuest}
                    onEdit={handleEditQuest}
                    onArchive={handleArchiveQuest}
                    onDelete={handleDeleteQuest}
                    emptyMessage="No active quests. Create one to get started!"
                />

                <QuestSection
                    title="Completed Quests"
                    quests={completedQuests}
                    onArchive={handleArchiveQuest}
                    onDelete={handleDeleteQuest}
                    isCompleted
                    emptyMessage="No completed quests yet. Complete your first quest!"
                    collapsible
                    defaultCollapsed
                />

                <QuestSection
                    title="Archived Quests"
                    quests={archivedQuests}
                    onRevive={handleReviveQuest}
                    onDelete={handleDeleteQuest}
                    isArchived
                    emptyMessage="No archived quests."
                    collapsible
                    defaultCollapsed
                />
            </div>

            <ConfirmModal
                isOpen={confirmModal.show}
                title="Delete Quest?"
                message="This action cannot be undone. Are you sure?"
                onConfirm={confirmModal.action}
                onCancel={() => setConfirmModal({ show: false, action: null, quest: null })}
            />
        </div>
    );
};

const QuestSection = ({ title, quests, onComplete, onEdit, onArchive, onRevive, onDelete, isCompleted, isArchived, emptyMessage, collapsible = false, defaultCollapsed = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className="quest-section">
            <div className="quest-section-header">
                <h3>
                    {collapsible && (
                        <button
                            className="collapse-toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-label={isCollapsed ? "Expand" : "Collapse"}
                        >
                            {isCollapsed ? '▶' : '▼'}
                        </button>
                    )}
                    {title} ({quests.length})
                </h3>
            </div>
            {!isCollapsed && (
                quests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="quest-list">
                        {quests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                onComplete={onComplete}
                                onEdit={onEdit}
                                onArchive={onArchive}
                                onRevive={onRevive}
                                onDelete={onDelete}
                                isCompleted={isCompleted}
                                isArchived={isArchived}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

const QuestCard = ({ quest, onComplete, onEdit, onArchive, onRevive, onDelete, isCompleted, isArchived }) => {
    return (
        <div className="quest-card card-appear">
            <div className="quest-header">
                <h4>{quest.title}</h4>
                <div className="quest-rewards">
                    <span className="reward xp">+{quest.xpReward} XP</span>
                    <span className="reward coins">+{quest.coinReward} 💰</span>
                </div>
            </div>
            <p className="quest-description">{quest.description}</p>
            {quest.deadline && (
                <p className="quest-deadline">📅 Due: {new Date(quest.deadline).toLocaleDateString()}</p>
            )}
            {quest.tags && quest.tags.length > 0 && (
                <div className="quest-tags">
                    {quest.tags.map((tag, i) => (
                        <span key={i} className="badge">{tag}</span>
                    ))}
                </div>
            )}
            <div className="quest-actions">
                {!isCompleted && !isArchived && (
                    <>
                        <button className="btn btn-success btn-sm" onClick={() => onComplete(quest)}>
                            ✓ Complete
                        </button>
                        <button className="btn btn-sm" onClick={() => onEdit(quest)}>
                            ✎ Edit
                        </button>
                        <button className="btn btn-sm" onClick={() => onArchive(quest)}>
                            📦 Archive
                        </button>
                    </>
                )}
                {isCompleted && (
                    <button className="btn btn-sm" onClick={() => onArchive(quest)}>
                        📦 Archive
                    </button>
                )}
                {isArchived && (
                    <button className="btn btn-sm" onClick={() => onRevive(quest)}>
                        🔄 Revive
                    </button>
                )}
                <button className="btn btn-sm" onClick={() => onDelete(quest)}>
                    🗑 Delete
                </button>
            </div>
        </div>
    );
};

export default QuestLog;
