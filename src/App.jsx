import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/animations.css';
import Header from './components/Header';
import QuestLog from './components/QuestLog';
import Shop from './components/Shop';
import Profile from './components/Profile';
import AIQuestAssistant from './components/AIQuestAssistant';
import LevelUpModal from './components/LevelUpModal';
import { loadUserProfile, saveUserProfile, loadQuests, saveQuests, loadShopItems, saveShopItems } from './utils/storage';
import { calculateLevel } from './utils/levelSystem';

function App() {
  const [currentTab, setCurrentTab] = useState('Quest Log');
  const [profileAction, setProfileAction] = useState(null);
  const [userProfile, setUserProfile] = useState(loadUserProfile());
  const [quests, setQuests] = useState(loadQuests());
  const [shopItems, setShopItems] = useState(loadShopItems());
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState(calculateLevel(userProfile.xp));

  // AI Assistant State (Lifted for persistence across tabs)
  const [aiMessages, setAiMessages] = useState([]);
  const [aiGeneratedQuests, setAiGeneratedQuests] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleTabChange = (tab, action = null) => {
    setCurrentTab(tab);
    if (action) {
      setProfileAction(action);
    }
  };

  // Save user profile when it changes
  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  // Save quests when they change
  useEffect(() => {
    saveQuests(quests);
  }, [quests]);

  // Save shop items when they change
  useEffect(() => {
    saveShopItems(shopItems);
  }, [shopItems]);

  // Check for level up
  useEffect(() => {
    const currentLevel = calculateLevel(userProfile.xp);
    if (currentLevel > newLevel) {
      setNewLevel(currentLevel);
      setShowLevelUpModal(true);
    }
  }, [userProfile.xp, newLevel]);

  const addQuest = (quest) => {
    setQuests(prevQuests => [...prevQuests, { ...quest, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), status: 'active' }]);
  };

  const updateQuest = (updatedQuest) => {
    setQuests(quests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
  };

  const deleteQuest = (questId) => {
    setQuests(quests.filter(q => q.id !== questId));
  };

  const addShopItem = (item) => {
    setShopItems(prevItems => [...prevItems, { ...item, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }]);
  };

  const updateShopItem = (updatedItem) => {
    setShopItems(shopItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteShopItem = (itemId) => {
    setShopItems(shopItems.filter(item => item.id !== itemId));
  };

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'Quest Log':
        return (
          <QuestLog
            quests={quests}
            userProfile={userProfile}
            onAddQuest={addQuest}
            onUpdateQuest={updateQuest}
            onDeleteQuest={deleteQuest}
            setUserProfile={setUserProfile}
          />
        );
      case 'Shop':
        return (
          <Shop
            shopItems={shopItems}
            userProfile={userProfile}
            onAddShopItem={addShopItem}
            onUpdateShopItem={updateShopItem}
            onDeleteShopItem={deleteShopItem}
            setUserProfile={setUserProfile}
          />
        );
      case 'Profile':
        return (
          <Profile
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            profileAction={profileAction}
            onActionHandled={() => setProfileAction(null)}
          />
        );
      case 'Quest Master':
        return (
          <AIQuestAssistant
            userProfile={userProfile}
            onAddQuest={addQuest}
            existingQuests={quests}
            messages={aiMessages}
            setMessages={setAiMessages}
            generatedQuests={aiGeneratedQuests}
            setGeneratedQuests={setAiGeneratedQuests}
            isLoading={isAiLoading}
            setIsLoading={setIsAiLoading}
            onAddItem={addShopItem}
            shopItems={shopItems}
          />
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="app">
      <Header
        userProfile={userProfile}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
      <main className="app-content">
        {renderCurrentTab()}
      </main>
      <LevelUpModal
        isOpen={showLevelUpModal}
        newLevel={newLevel}
        onClose={() => setShowLevelUpModal(false)}
      />
    </div>
  );
}

export default App;
