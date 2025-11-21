import React from 'react';
import './Header.css';
import { calculateLevel, getLevelStats } from '../utils/levelSystem';

const Header = ({ userProfile, currentTab, onTabChange }) => {
    const stats = getLevelStats(userProfile.xp);

    return (
        <header className="header">
            <div className="header-title">
                <h1>⚔️ RetroQuest</h1>
                <div className='miniview'>
                    <div className='profile-n-stats'>
                        <div className="stats-display">
                            <div className="stat">
                                <span className="stat-label">Level</span>
                                <span className="stat-value">{stats.level}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">XP</span>
                                <div className="xp-fraction-display">
                                    <span className="xp-current">{Math.round(stats.levelXP)}</span>
                                    <span className="xp-divider">/</span>
                                    <span className="xp-total">{Math.round(stats.nextLevelXP)}</span>
                                </div>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Coins</span>
                                <span className="stat-value">{userProfile.coins}</span>
                            </div>
                        </div>
                        <div
                            className="user-profile-mini"
                            onClick={() => onTabChange('Profile', 'scrollToSettings')}
                            role="button"
                            tabIndex={0}
                        >
                            <span className="avatar-mini">{userProfile.avatar}</span>
                            <div className="user-info-mini">
                                <div className="username-mini">{userProfile.displayName}</div>
                                <div className="class-mini">{userProfile.class}</div>
                            </div>
                        </div>
                    </div>
                    <div className="level-progress-container" title={`Progress to Level ${stats.level + 1}: ${Math.round(stats.progress)}%`}>
                        <div
                            className="level-progress-bar"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                </div>
            </div>
            <nav className="nav-tabs">
                {['Quest Log', 'Shop', 'Profile', 'Quest Master'].map(tab => (
                    <button
                        key={tab}
                        className={`nav-tab ${currentTab === tab ? 'active' : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default Header;
