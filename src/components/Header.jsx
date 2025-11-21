import React from 'react';
import './Header.css';
import { calculateLevel } from '../utils/levelSystem';

const Header = ({ userProfile, currentTab, onTabChange }) => {
    const level = calculateLevel(userProfile.xp);

    return (
        <header className="header">
            <div className="header-title">
                <h1>⚔️ RetroQuest</h1>
                <div className='profile-n-stats'>
                    <div className="stats-display">
                        <div className="stat">
                            <span className="stat-label">Level</span>
                            <span className="stat-value">{level}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">XP</span>
                            <span className="stat-value">{userProfile.xp}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Coins</span>
                            <span className="stat-value">{userProfile.coins}</span>
                        </div>
                    </div>
                    <div
                        className="user-profile-mini"
                        onClick={() => onTabChange('Profile')}
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
