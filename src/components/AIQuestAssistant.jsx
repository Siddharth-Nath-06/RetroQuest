import React, { useState, useEffect } from 'react';
import './AIQuestAssistant.css';
import { detectAICapability, generateQuestsFromPrompt } from '../utils/aiService';
import { saveGeminiApiKey, loadGeminiApiKey } from '../utils/storage';

const AIQuestAssistant = ({ userProfile, onAddQuest }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiCapability, setAICapability] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [generatedQuests, setGeneratedQuests] = useState([]);

    useEffect(() => {
        const checkAI = async () => {
            const capability = await detectAICapability();
            setAICapability(capability);

            if (!capability.available) {
                const savedKey = loadGeminiApiKey();
                setApiKey(savedKey);
                if (!savedKey) {
                    setShowApiKeyInput(true);
                }
            }
        };
        checkAI();
    }, []);

    const handleSaveApiKey = () => {
        saveGeminiApiKey(apiKey);
        setShowApiKeyInput(false);
        window.location.reload(); // Reload to detect new capability
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMsg = {
            role: 'user',
            content: inputMessage
        };

        setMessages([...messages, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const result = await generateQuestsFromPrompt(inputMessage, userProfile);

            if (result.success) {
                const aiMsg = {
                    role: 'assistant',
                    content: `Hark! I have crafted ${result.quests.length} noble quest${result.quests.length > 1 ? 's' : ''} for thee! Review thy quests below and choose which to undertake.`,
                    quests: result.quests,
                    source: result.source
                };
                setMessages(prev => [...prev, aiMsg]);
                setGeneratedQuests(result.quests);
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

    const handleAddQuest = (quest) => {
        onAddQuest(quest);
        alert(`Quest "${quest.title}" has been inscribed in thy quest log!`);
    };

    const handleAddAllQuests = () => {
        generatedQuests.forEach(quest => onAddQuest(quest));
        alert(`${generatedQuests.length} quests have been added to thy sacred quest log!`);
        setGeneratedQuests([]);
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
                        </div>
                    )}
                </div>

                {
                    !aiCapability?.available && showApiKeyInput ? (
                        <div className="api-key-setup">
                            <h3>⚔️ Summon the Quest Master</h3>
                            <p>To receive quests from the Quest Master, choose one of these magical connections:</p>

                            <div className="setup-method">
                                <h4>☁️ Method 1: Gemini API Key (Recommended - Works Reliably)</h4>
                                <p>Free and easy to set up:</p>
                                <ol>
                                    <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                                    <li>Click "Create API Key" (requires Google account)</li>
                                    <li>Copy your API key and paste it below</li>
                                    <li>Click "Activate Connection"</li>
                                </ol>
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
                            </div>

                            <div className="setup-method">
                                <h4>🔮 Method 2: Chrome Prompt API (Experimental)</h4>
                                <p><strong>Note:</strong> Highly experimental. Requires ~22GB free disk space and specific hardware.</p>
                                <ol>
                                    <li>Enable <code>chrome://flags/#prompt-api-for-gemini-nano</code> → <strong>"Enabled"</strong></li>
                                    <li>Enable <code>chrome://flags/#optimization-guide-on-device-model</code> → <strong>"Enabled BypassPerfRequirement"</strong></li>
                                    <li>Restart Chrome completely</li>
                                    <li>Go to <code>chrome://components</code> and find "Optimization Guide On Device Model"</li>
                                    <li>If missing or version 0.0.0.0, click "Check for update"</li>
                                    <li><strong>Troubleshooting:</strong> Open Console (F12) and run <code>await window.ai.languageModel.create()</code> or <code>await LanguageModel.create()</code></li>
                                    <li>Reload RetroQuest to start talking to Quest Master!</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="chat-intro">
                                <p>
                                    Greetings, adventurer! Share your aspirations with me, and I shall forge legendary quests to guide your journey! Speak to me of your goals:
                                </p>
                                <ul>
                                    <li>"I seek to master the ancient art of React"</li>
                                    <li>"I wish to strengthen my body through training"</li>
                                    <li>"My workspace requires order and discipline"</li>
                                </ul>
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
                                                {msg.quests.map((quest, qIndex) => (
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
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleAddQuest(quest)}
                                                        >
                                                            + Add Quest
                                                        </button>
                                                    </div>
                                                ))}
                                                {msg.quests.length > 1 && (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleAddAllQuests}
                                                    >
                                                        + Add All Quests
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="message assistant">
                                        <div className="typing-indicator">
                                            <span>.</span><span>.</span><span>.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Speak your quest, brave adventurer..."
                                    disabled={isLoading}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                >
                                    ⚔️ Seek Quests
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
