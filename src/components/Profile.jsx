import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';
import { AVATAR_EMOJIS, CHARACTER_CLASSES } from '../utils/constants';
import { calculateLevel, getMaxQuestXP, getMaxQuestCoins, getGlobalXPCap, getGlobalCoinCap } from '../utils/levelSystem';
import { exportData, importData, wipeData, STORAGE_KEYS } from '../utils/storage';

const Profile = ({ userProfile, setUserProfile, profileAction, onActionHandled }) => {
    const [displayName, setDisplayName] = useState(userProfile.displayName);
    const [selectedClass, setSelectedClass] = useState(userProfile.class);
    const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
    const [wipeSelection, setWipeSelection] = useState({
        quests: false,
        items: false,
        profile: false,
        templates: false
    });
    const fileInputRef = useRef(null);
    const settingsRef = useRef(null);

    const level = calculateLevel(userProfile.xp);

    useEffect(() => {
        if (profileAction === 'scrollToSettings' && settingsRef.current) {
            settingsRef.current.scrollIntoView({ behavior: 'smooth' });
            onActionHandled();
        }
    }, [profileAction, onActionHandled]);

    const handleExport = () => {
        const data = exportData();
        if (!data) {
            alert('Failed to export data.');
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'retroquest_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                const result = importData(jsonData);
                if (result.success) {
                    alert('Data imported successfully! Reloading...');
                    window.location.reload();
                } else {
                    alert('Import failed: ' + result.error);
                }
            } catch (error) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const handleWipeSelectionChange = (e) => {
        const { name, checked } = e.target;
        setWipeSelection(prev => ({ ...prev, [name]: checked }));
    };

    const handleWipeData = () => {
        const keysToWipe = [];
        if (wipeSelection.quests) keysToWipe.push('QUESTS');
        if (wipeSelection.items) keysToWipe.push('SHOP_ITEMS');
        if (wipeSelection.profile) keysToWipe.push('USER_PROFILE');
        if (wipeSelection.templates) keysToWipe.push('TEMPLATES');

        if (keysToWipe.length === 0) {
            alert('Please select data to wipe.');
            return;
        }

        if (window.confirm('Are you sure you want to wipe the selected data? This cannot be undone!')) {
            if (wipeData(keysToWipe)) {
                alert('Data wiped successfully! Reloading...');
                window.location.reload();
            } else {
                alert('Failed to wipe data.');
            }
        }
    };

    const handleSave = () => {
        setUserProfile({
            ...userProfile,
            displayName,
            class: selectedClass,
            avatar: selectedAvatar
        });
        alert('Profile saved!');
    };

    return (
        <div className="profile-container">
            <div className="panel">
                <div className="panel-header">
                    <h2>📊 Statistics</h2>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Current Level</div>
                        <div className="stat-value-large">{level}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total XP</div>
                        <div className="stat-value-large">{userProfile.xp}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Coins</div>
                        <div className="stat-value-large">{userProfile.coins}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Quests Completed</div>
                        <div className="stat-value-large">{userProfile.questsCompleted || 0}</div>
                    </div>
                </div>

                <h3>Level Caps</h3>
                <div className="caps-info">
                    <p>Max XP per Quest: <strong>{getMaxQuestXP(level)}</strong></p>
                    <p>Max Coins per Quest: <strong>{getMaxQuestCoins(level)}</strong></p>
                    <p>Global XP Cap: <strong>{getGlobalXPCap(level)}</strong></p>
                    <p>Global Coin Cap: <strong>{getGlobalCoinCap(level)}</strong></p>
                </div>
            </div>

            <div className="panel" ref={settingsRef}>
                <div className="panel-header">
                    <h2>⚙️ Profile Settings</h2>
                </div>

                <div className="profile-section">
                    <label>Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={30}
                    />
                </div>

                <div className="profile-section">
                    <label>Class</label>
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        {CHARACTER_CLASSES.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>

                <div className="profile-section">
                    <label>Avatar</label>
                    <div className="avatar-picker">
                        {AVATAR_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                className={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                                onClick={() => setSelectedAvatar(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary" onClick={handleSave}>
                    Save Profile
                </button>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2>💾 Data Management</h2>
                </div>

                <div className="profile-section">
                    <p>Manage your local data. Export to backup or transfer, import to restore.</p>
                    <div className="data-management-controls">
                        <button className="btn btn-secondary" onClick={handleExport}>
                            📥 Export Data
                        </button>
                        <button className="btn btn-secondary" onClick={handleImportClick}>
                            📤 Import Data
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    <p>Select data to permanently wipe from your browser.</p>
                    <div className="wipe-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="quests"
                                checked={wipeSelection.quests}
                                onChange={handleWipeSelectionChange}
                            />
                            Saved Quests
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="items"
                                checked={wipeSelection.items}
                                onChange={handleWipeSelectionChange}
                            />
                            Inventory & Items
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="profile"
                                checked={wipeSelection.profile}
                                onChange={handleWipeSelectionChange}
                            />
                            Level, XP & Coins
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="templates"
                                checked={wipeSelection.templates}
                                onChange={handleWipeSelectionChange}
                            />
                            Saved Templates
                        </label>
                    </div>
                    <button className="btn btn-danger" onClick={handleWipeData}>
                        🗑 Wipe Selected Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
