import React, { useState, useEffect, useRef } from 'react';
import './AIQuestAssistant.css';
import { detectAICapability, checkChromeAIAvailability, generateQuestsFromPrompt } from '../utils/aiService';
import { saveGeminiApiKey, loadGeminiApiKey, saveAiMethodPreference, loadAiMethodPreference } from '../utils/storage';
import { SHOP_CATEGORIES } from '../utils/constants';

const AIQuestAssistant = ({
    userProfile,
    onAddQuest,
    existingQuests = [],
    messages,
    setMessages,
    generatedQuests,
    setGeneratedQuests,
    isLoading,
    setIsLoading,
    onAddItem,
    shopItems = []
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [aiCapability, setAICapability] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [addedQuests, setAddedQuests] = useState(new Set());
    const [addedItems, setAddedItems] = useState(new Set());
    const [confirmingQuestId, setConfirmingQuestId] = useState(null);
    const [chromeAIAvailable, setChromeAIAvailable] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [generationMode, setGenerationMode] = useState('quest'); // 'quest' or 'item'
    const [generatedItems, setGeneratedItems] = useState([]);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const checkAI = async () => {
            // Check Chrome AI availability for button state
            const chromeAvailable = await checkChromeAIAvailability();
            setChromeAIAvailable(chromeAvailable);

            // Load user's preferred method
            const preferredMethod = loadAiMethodPreference();

            // Detect AI capability based on preference
            const capability = await detectAICapability(preferredMethod);
            setAICapability(capability);

            if (!capability.available) {
                const savedKey = loadGeminiApiKey();
                setApiKey(savedKey);
                if (!savedKey && !preferredMethod) {
                    setShowApiKeyInput(true);
                }
            }
        };
        checkAI();
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputMessage]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSaveApiKey = async () => {
        saveGeminiApiKey(apiKey);
        saveAiMethodPreference('gemini-api');
        setShowApiKeyInput(false);
        // Re-detect AI capability with new preference
        const capability = await detectAICapability('gemini-api');
        setAICapability(capability);
    };

    const handleSelectChromeAI = async () => {
        const available = await checkChromeAIAvailability();
        if (available) {
            saveAiMethodPreference('chrome-ai');
            // Re-detect AI capability with new preference
            const capability = await detectAICapability('chrome-ai');
            setAICapability(capability);
            setShowApiKeyInput(false);
        } else {
            alert('Chrome AI is not available on this browser. Please check the setup instructions or use Gemini API instead.');
        }
    };

    const handleSelectGeminiAPI = () => {
        setSelectedMethod('gemini-api');
    };

    const handleResetAIMethod = () => {
        setAICapability(null);
        setShowApiKeyInput(true);
        setSelectedMethod(null);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMsg = {
            role: 'user',
            content: inputMessage
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const result = await generateQuestsFromPrompt(inputMessage, userProfile, generationMode);

            if (result.success) {
                let aiMsg;
                if (generationMode === 'quest') {
                    aiMsg = {
                        role: 'assistant',
                        content: `Hark! I have crafted ${result.quests.length} noble quest${result.quests.length > 1 ? 's' : ''} for thee! Review thy quests below and choose which to undertake.`,
                        quests: result.quests,
                        source: result.source
                    };
                    setGeneratedQuests(result.quests);
                    setGeneratedItems([]);
                } else {
                    aiMsg = {
                        role: 'assistant',
                        content: `I've found ${result.items.length} wonderful item${result.items.length > 1 ? 's' : ''} for your shop! Take a look below.`,
                        items: result.items,
                        source: result.source
                    };
                    setGeneratedItems(result.items);
                    setGeneratedQuests([]);
                }
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errorMsg = {
                    role: 'assistant',
                    content: `Error: ${result.error}`,
                    isError: true
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (error) {
            const errorMsg = {
                role: 'assistant',
                content: `Error: ${error.message}`,
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = (item, index) => {
        const itemId = `${item.name}-${index}`;

        if (addedItems.has(itemId)) return;

        // Check for duplicates in existing shop items
        // Shop items use 'title', generated items use 'name'
        const isDuplicate = shopItems.some(i => i.title === item.name);
        if (isDuplicate && confirmingQuestId !== itemId) {
            setConfirmingQuestId(itemId);
            setTimeout(() => {
                setConfirmingQuestId(prev => prev === itemId ? null : prev);
            }, 3000);
            return;
        }

        // Map category
        let category = item.category;
        const validCategories = Object.values(SHOP_CATEGORIES);
        if (!validCategories.includes(category)) {
            category = SHOP_CATEGORIES.MISC;
        }

        // Create new shop item
        const newItem = {
            ...item,
            title: item.name, // Map name to title
            category: category,
            id: Date.now() + Math.random(),
            purchased: false,
            visible: true
        };

        onAddItem(newItem);
        setAddedItems(prev => new Set(prev).add(itemId));
        setConfirmingQuestId(null);
    };

    const handleAddAllItems = (items) => {
        let newAdded = new Set(addedItems);
        let addedCount = 0;
        let skippedCount = 0;

        items.forEach((item, index) => {
            const itemId = `${item.name}-${index}`;

            if (newAdded.has(itemId)) {
                skippedCount++;
                return;
            }

            const isDuplicate = shopItems.some(i => i.title === item.name);
            if (isDuplicate) {
                skippedCount++;
                return;
            }

            let category = item.category;
            const validCategories = Object.values(SHOP_CATEGORIES);
            if (!validCategories.includes(category)) {
                category = SHOP_CATEGORIES.MISC;
            }

            const newItem = {
                ...item,
                title: item.name,
                category: category,
                id: Date.now() + Math.random(),
                purchased: false,
                visible: true
            };

            onAddItem(newItem);
            newAdded.add(itemId);
            addedCount++;
        });

        setAddedItems(newAdded);
    };

    const handleAddQuest = (quest, index) => {
        // Create a unique ID for tracking locally within this session
        const questId = `${quest.title}-${index}`;

        // 1. Check if already added in this session (UI state)
        if (addedQuests.has(questId)) return;

        // 2. Check if already exists in main quest log (Persistence state)
        const isDuplicate = existingQuests.some(q => q.title === quest.title);

        // If it's a duplicate and we haven't confirmed it yet
        if (isDuplicate && confirmingQuestId !== questId) {
            setConfirmingQuestId(questId);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => {
                setConfirmingQuestId(prev => prev === questId ? null : prev);
            }, 3000);
            return;
        }

        onAddQuest(quest);
        setAddedQuests(prev => new Set(prev).add(questId));
        setConfirmingQuestId(null);
    };

    const handleAddAllQuests = (quests) => {
        let newAdded = new Set(addedQuests);
        let addedCount = 0;
        let skippedCount = 0;

        quests.forEach((quest, index) => {
            const questId = `${quest.title}-${index}`;

            // Skip if already added in this session
            if (newAdded.has(questId)) {
                skippedCount++;
                return;
            }

            // Skip if already in main quest log
            const isDuplicate = existingQuests.some(q => q.title === quest.title);
            if (isDuplicate) {
                skippedCount++;
                return;
            }

            onAddQuest(quest);
            newAdded.add(questId);
            addedCount++;
        });

        setAddedQuests(newAdded);

        if (addedCount > 0) {
            alert(`${addedCount} quests have been added to thy sacred quest log!${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`);
        } else {
            alert(`No new quests were added. They may already be in your log!`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="ai-assistant-container">
            <div className="panel">
                <div className="panel-header">
                    <h2>🧙‍♂️ Quest Master</h2>
                    {aiCapability && (
                        <div className="ai-status">
                            {aiCapability.type === 'chrome-prompt-api' ? (
                                <span className="status-badge chrome">Chrome AI ✓</span>
                            ) : aiCapability.type === 'gemini-api' ? (
                                <span className="status-badge cloud">Cloud AI ✓</span>
                            ) : (
                                <span className="status-badge offline">Not Connected</span>
                            )}
                            <button
                                className="btn btn-sm change-method-btn"
                                onClick={handleResetAIMethod}
                                title="Change AI Method"
                            >
                                🔄 Change Method
                            </button>
                        </div>
                    )}
                </div>

                {
                    !aiCapability?.available && showApiKeyInput ? (
                        <div className="api-key-setup">
                            <h3>⚔️ Summon the Quest Master</h3>
                            <p>Choose your preferred AI method to begin generating quests:</p>

                            {!selectedMethod ? (
                                <div className="method-selection-buttons">
                                    <button
                                        className="btn btn-lg method-choice-card"
                                        onClick={handleSelectChromeAI}
                                        disabled={!chromeAIAvailable}
                                        title={chromeAIAvailable ? "Use Chrome's built-in AI" : "Chrome AI not available"}
                                    >
                                        <div className="method-icon">🔮</div>
                                        <div className="method-title">Chrome AI</div>
                                        <div className="method-description">
                                            {chromeAIAvailable ?
                                                "Built-in, private, offline" :
                                                "Not Available"}
                                        </div>
                                    </button>

                                    <button
                                        className="btn btn-lg method-choice-card"
                                        onClick={handleSelectGeminiAPI}
                                    >
                                        <div className="method-icon">☁️</div>
                                        <div className="method-title">Gemini API</div>
                                        <div className="method-description">
                                            Cloud-based, reliable, free
                                        </div>
                                    </button>
                                </div>
                            ) : selectedMethod === 'gemini-api' ? (
                                <div className="setup-method">
                                    <h4>☁️ Gemini API Key Setup</h4>
                                    <p>Get your free API key from Google AI Studio:</p>
                                    <ol>
                                        <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                                        <li>Sign in with your Google account</li>
                                        <li>Click "Get API Key" or "Create API Key"</li>
                                        <li>If prompted, create a new Google Cloud project (free tier available)</li>
                                        <li>Select "Create API key in new project" or choose an existing project</li>
                                        <li>Copy your API key and paste it below</li>
                                        <li>Click "Activate Connection"</li>
                                    </ol>
                                    <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
                                        💡 <strong>Note:</strong> Google AI Studio provides a generous free tier. You'll need to create a Google Cloud project, but no credit card is required for the free tier.
                                    </p>
                                    <div className="form-group">
                                        <label>🗝️ Gemini API Key</label>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="Enter your magical key"
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSaveApiKey}
                                        disabled={!apiKey.trim()}
                                    >
                                        🔮 Activate Connection
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedMethod(null)}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        ← Back
                                    </button>
                                </div>
                            ) : null}

                            <div className="setup-help">
                                <details>
                                    <summary>🔮 Chrome AI Setup Instructions (Advanced)</summary>
                                    <p><strong>Note:</strong> Highly experimental. Requires ~22GB free disk space and specific hardware.</p>
                                    <ol>
                                        <li>Enable <code>chrome://flags/#prompt-api-for-gemini-nano</code> → <strong>"Enabled"</strong></li>
                                        <li>Enable <code>chrome://flags/#optimization-guide-on-device-model</code> → <strong>"Enabled BypassPerfRequirement"</strong></li>
                                        <li>Restart Chrome completely</li>
                                        <li>Go to <code>chrome://components</code> and find "Optimization Guide On Device Model"</li>
                                        <li>If missing or version 0.0.0.0, click "Check for update"</li>
                                        <li><strong>Troubleshooting:</strong> Open Console (F12) and run <code>await LanguageModel.create()</code></li>
                                        <li>Reload RetroQuest to start talking to Quest Master!</li>
                                    </ol>
                                </details>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mode-toggle-container">
                                <div className="mode-toggle">
                                    <button
                                        className={`mode-btn ${generationMode === 'quest' ? 'active' : ''}`}
                                        onClick={() => setGenerationMode('quest')}
                                    >
                                        📜 Quest Mode
                                    </button>
                                    <button
                                        className={`mode-btn ${generationMode === 'item' ? 'active' : ''}`}
                                        onClick={() => setGenerationMode('item')}
                                    >
                                        ⚗️ Item Mode
                                    </button>
                                </div>
                            </div>

                            <div className={`chat-intro ${generationMode === 'item' ? 'item-mode' : ''}`}>
                                {generationMode === 'quest' ? (
                                    <>
                                        <p>
                                            Greetings, adventurer! Share your aspirations with me, and I shall forge legendary quests to guide your journey! Speak to me of your goals:
                                        </p>
                                        <ul>
                                            <li>"I seek to master the ancient art of React"</li>
                                            <li>"I wish to strengthen my body through training"</li>
                                            <li>"My workspace requires order and discipline"</li>
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            Welcome to the Item Forge! Tell me what real-world rewards you've earned or wish to buy, and I'll stock your shop with fine wares!
                                        </p>
                                        <ul>
                                            <li>"I want to buy a movie ticket this weekend"</li>
                                            <li>"I have a chocolate bar I want to earn"</li>
                                            <li>"I need a spa day reward"</li>
                                        </ul>
                                    </>
                                )}
                                <div className="chat-warning">
                                    ⚠️ <strong>Note:</strong> Chat history is not saved and will be lost on page reload or browser close.
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                                        <div className="message-content">
                                            {msg.content}
                                            {msg.source && (
                                                <div className="message-source">
                                                    ({msg.source === 'chrome-ai' ? 'Chrome AI' : 'Cloud AI'})
                                                </div>
                                            )}
                                        </div>
                                        {msg.quests && msg.quests.length > 0 && (
                                            <div className="generated-quests">
                                                {msg.quests.map((quest, qIndex) => {
                                                    const questId = `${quest.title}-${qIndex}`;
                                                    const isAdded = addedQuests.has(questId);
                                                    const isConfirming = confirmingQuestId === questId;
                                                    return (
                                                        <div key={qIndex} className="quest-preview">
                                                            <h4>{quest.title}</h4>
                                                            <p>{quest.description}</p>
                                                            <div className="quest-preview-rewards">
                                                                <span>+{quest.xpReward} XP</span>
                                                                <span>+{quest.coinReward} 💰</span>
                                                                {quest.deadline && <span>📅 {quest.deadline}</span>}
                                                            </div>
                                                            {quest.tags && quest.tags.length > 0 && (
                                                                <div className="quest-preview-tags">
                                                                    {quest.tags.map((tag, tIndex) => (
                                                                        <span key={tIndex} className="badge">{tag}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <button
                                                                className={`btn btn-sm ${isAdded ? 'btn-secondary' : isConfirming ? 'btn-warning' : 'btn-success'}`}
                                                                style={isConfirming ? { backgroundColor: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' } : {}}
                                                                onClick={() => handleAddQuest(quest, qIndex)}
                                                                disabled={isAdded}
                                                            >
                                                                {isAdded ? '✓ Added' : isConfirming ? '⚠️ Add Duplicate?' : '+ Add Quest'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {msg.quests.length > 1 && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleAddAllQuests(msg.quests)}
                                                    >
                                                        + Add All Quests
                                                    </button >
                                                )}
                                            </div>
                                        )}
                                        {msg.items && msg.items.length > 0 && (
                                            <div className="generated-items">
                                                {msg.items.map((item, iIndex) => {
                                                    const itemId = `${item.name}-${iIndex}`;
                                                    const isAdded = addedItems.has(itemId);
                                                    const isConfirming = confirmingQuestId === itemId;
                                                    return (
                                                        <div key={iIndex} className="item-preview">
                                                            <div className="item-preview-header">
                                                                <span className="item-emoji">{item.emoji}</span>
                                                                <h4>{item.name}</h4>
                                                            </div>
                                                            <p>{item.description}</p>
                                                            <div className="item-preview-details">
                                                                <span className="item-cost">{item.cost} 💰</span>
                                                                <span className="item-category badge">{item.category}</span>
                                                            </div>
                                                            <button
                                                                className={`btn btn-sm ${isAdded ? 'btn-secondary' : isConfirming ? 'btn-warning' : 'btn-success'}`}
                                                                style={isConfirming ? { backgroundColor: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' } : {}}
                                                                onClick={() => handleAddItem(item, iIndex)}
                                                                disabled={isAdded}
                                                            >
                                                                {isAdded ? '✓ Added' : isConfirming ? '⚠️ Add Duplicate?' : '+ Add to Shop'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {msg.items.length > 1 && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleAddAllItems(msg.items)}
                                                    >
                                                        + Add All Items
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {messages.length === 0 && !isLoading && (
                                    <div className="empty-chat-state">
                                        <div className="empty-chat-icon">
                                            {generationMode === 'quest' ? '💬' : '⚗️'}
                                        </div>
                                        <p>
                                            {generationMode === 'quest'
                                                ? "Your conversation with the Quest Master will appear here."
                                                : "Your item forging session will appear here."}
                                        </p>
                                        <p className="empty-chat-hint">
                                            {generationMode === 'quest'
                                                ? "Start by describing your goals or tasks below!"
                                                : "Describe the rewards you want to add to your shop!"}
                                        </p>
                                    </div>
                                )}
                                {isLoading && (
                                    <div className="message assistant">
                                        <div className="typing-indicator">
                                            <span>.</span><span>.</span><span>.</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input">
                                <textarea
                                    ref={textareaRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={generationMode === 'quest' ? "Speak your quest, brave adventurer..." : "Describe the rewards you seek..."}
                                    disabled={isLoading}
                                    rows={1}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                >
                                    {generationMode === 'quest' ? "⚔️ Seek Quests" : "⚗️ Forge Items"}
                                </button>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default AIQuestAssistant;
