import React, { useState } from 'react';
import './Shop.css';
import { SHOP_CATEGORIES, CATEGORY_ICONS, BUILT_IN_SHOP_TEMPLATES } from '../utils/constants';
import { validateShopItemForm } from '../utils/validation';
import { useDebounce } from '../hooks/useDebounce';
import { loadPurchaseHistory, addPurchaseToHistory } from '../utils/storage';

const Shop = ({ shopItems, userProfile, onAddShopItem, onUpdateShopItem, onDeleteShopItem, setUserProfile }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [sortOrder, setSortOrder] = useState('none'); // 'none', 'price-asc', 'price-desc'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: '',
        category: SHOP_CATEGORIES.MISC,
        visible: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [purchaseFeedback, setPurchaseFeedback] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState(loadPurchaseHistory());
    const [showHistory, setShowHistory] = useState(false);

    const { debouncedCallback } = useDebounce((item) => {
        purchaseItemAction(item);
    }, 500);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const itemData = {
            ...formData,
            cost: parseInt(formData.cost) || 0
        };

        const validation = validateShopItemForm(itemData);

        if (!validation.valid) {
            setFormErrors(validation.errors);
            return;
        }

        if (editingItem) {
            onUpdateShopItem({ ...editingItem, ...itemData });
        } else {
            onAddShopItem(itemData);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', cost: '', category: SHOP_CATEGORIES.MISC, visible: true });
        setFormErrors({});
        setShowForm(false);
        setEditingItem(null);
    };

    const applyTemplate = (template) => {
        setFormData({
            title: template.data.title,
            description: template.data.description,
            cost: template.data.cost.toString(),
            category: template.data.category,
            visible: template.data.visible
        });
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            cost: item.cost.toString(),
            category: item.category,
            visible: item.visible
        });
        setShowForm(true);
    };

    const purchaseItemAction = (item) => {
        if (userProfile.coins < item.cost) {
            return;
        }

        setUserProfile({
            ...userProfile,
            coins: userProfile.coins - item.cost
        });

        // Add to purchase history
        const purchase = {
            title: item.title,
            cost: item.cost,
            purchasedAt: new Date().toISOString()
        };
        addPurchaseToHistory(purchase);
        setPurchaseHistory(loadPurchaseHistory());

        // Show purchase feedback
        setPurchaseFeedback({
            title: item.title,
            category: item.category
        });
        setTimeout(() => setPurchaseFeedback(null), 3000);
    };

    const handlePurchase = (item) => {
        debouncedCallback(item);
    };

    // Sort items based on selected sort order
    const sortedItems = [...shopItems].sort((a, b) => {
        if (sortOrder === 'price-asc') {
            return a.cost - b.cost;
        } else if (sortOrder === 'price-desc') {
            return b.cost - a.cost;
        }
        return 0; // no sorting
    });

    // Filter visible and hidden items
    const visibleItems = sortedItems.filter(item => item.visible);
    const hiddenItems = sortedItems.filter(item => !item.visible);

    return (
        <div className="shop-container">
            <div className="panel">
                <div className="panel-header">
                    <h2>🏪 Shop</h2>
                    <div className="header-controls">
                        <div className="sort-controls">
                            <label>Sort by:</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="sort-select"
                            >
                                <option value="none">None</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                            </select>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
                            {showHistory ? 'Hide' : 'View'} Purchase History
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ New Item'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <form className="shop-form" onSubmit={handleSubmit}>
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
                                <label>Cost (Coins)</label>
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleInputChange}
                                />
                                {formErrors.cost && <div className="error-message">{formErrors.cost}</div>}
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    {Object.values(SHOP_CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="visible"
                                    checked={formData.visible}
                                    onChange={handleInputChange}
                                    style={{ width: 'auto', marginRight: '8px' }}
                                />
                                Visible in shop
                            </label>
                        </div>

                        <div className="template-section">
                            <label>Quick Start Templates:</label>
                            <div className="template-buttons">
                                {BUILT_IN_SHOP_TEMPLATES.map(template => (
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
                                {editingItem ? 'Update Item' : 'Create Item'}
                            </button>
                            <button type="button" className="btn" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {purchaseFeedback && (
                <div className="purchase-feedback bounce-animation">
                    {CATEGORY_ICONS[purchaseFeedback.category]} Item bought: {purchaseFeedback.title}
                </div>
            )}

            {showHistory && (
                <div className="panel purchase-history-panel">
                    <h3>📜 Purchase History</h3>
                    {purchaseHistory.length > 0 ? (
                        <div className="purchase-history-list">
                            {purchaseHistory.map((purchase, index) => (
                                <div key={index} className="purchase-history-item">
                                    <div className="purchase-info">
                                        <span className="purchase-title">{purchase.title}</span>
                                        <span className="purchase-cost">💰 {purchase.cost}</span>
                                    </div>
                                    <div className="purchase-date">
                                        {new Date(purchase.purchasedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No purchases yet. Start completing quests to earn coins!</p>
                        </div>
                    )}
                </div>
            )}

            {visibleItems.length > 0 ? (
                <div className="shop-items-grid">
                    {visibleItems.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            userProfile={userProfile}
                            onPurchase={handlePurchase}
                            onEdit={handleEditItem}
                            onDelete={onDeleteShopItem}
                            onToggleVisibility={onUpdateShopItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p>No items available. Create some rewards!</p>
                </div>
            )}

            {hiddenItems.length > 0 && (
                <details className="hidden-items-section">
                    <summary>Hidden Items ({hiddenItems.length})</summary>
                    <div className="shop-items-grid">
                        {hiddenItems.map(item => (
                            <ShopItemCard
                                key={item.id}
                                item={item}
                                userProfile={userProfile}
                                onPurchase={handlePurchase}
                                onEdit={handleEditItem}
                                onDelete={onDeleteShopItem}
                                onToggleVisibility={onUpdateShopItem}
                                isHidden
                            />
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};

const ShopItemCard = ({ item, userProfile, onPurchase, onEdit, onDelete, onToggleVisibility, isHidden }) => {
    const canAfford = userProfile.coins >= item.cost;

    return (
        <div className={`shop-item-card ${isHidden ? 'hidden-item' : ''} card-appear`}>
            <div className="item-category-badge">
                {CATEGORY_ICONS[item.category]} {item.category}
            </div>
            <h4>{item.title}</h4>
            <p className="item-description">{item.description}</p>
            <div className="item-cost">💰 {item.cost} coins</div>
            <div className="item-actions">
                <div className="tooltip">
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => onPurchase(item)}
                        disabled={!canAfford}
                    >
                        Buy
                    </button>
                    {!canAfford && <span className="tooltiptext">Not enough coins</span>}
                </div>
                <button className="btn btn-sm" onClick={() => onEdit(item)}>
                    ✎ Edit
                </button>
                <button
                    className="btn btn-sm"
                    onClick={() => onToggleVisibility({ ...item, visible: !item.visible })}
                    title={item.visible ? "Hide item" : "Show item"}
                >
                    {item.visible ? '👁️' : '👁️‍🗨️'}
                </button>
                <button className="btn btn-sm" onClick={() => onDelete(item.id)}>
                    🗑
                </button>
            </div>
        </div>
    );
};

export default Shop;
