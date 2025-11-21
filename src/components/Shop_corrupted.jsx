import React, { useState } from 'react';
import './Shop.css';
import { SHOP_CATEGORIES, CATEGORY_ICONS, BUILT_IN_SHOP_TEMPLATES } from '../utils/constants';
import { validateShopItemForm } from '../utils/validation';
import { useDebounce } from '../hooks/useDebounce';

const Shop = ({ shopItems, userProfile, onAddShopItem, onUpdateShopItem, onDeleteShopItem, setUserProfile }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: '',
        category: SHOP_CATEGORIES.MISC,
        visible: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [purchaseFeedback, setPurchaseFeedback] = useState(null);

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

    const toggleCategory = (category) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    // Group items by category
    const itemsByCategory = Object.values(SHOP_CATEGORIES).reduce((acc, category) => {
        acc[category] = shopItems.filter(item => item.category === category);
        return acc;
    }, {});

    return (
        <div className="shop-container">
            <div className="panel">
                <div className="panel-header">
                    <h2>🏪 Shop</h2>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Item'}
                    </button>
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
    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
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
            setFormErrors({ });
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

    const toggleCategory = (category) => {
                setExpandedCategories({
                    ...expandedCategories,
                    [category]: !expandedCategories[category]
                });
    };

    // Group items by category
    const itemsByCategory = Object.values(SHOP_CATEGORIES).reduce((acc, category) => {
                acc[category] = shopItems.filter(item => item.category === category);
            return acc;
    }, { });

            return (
            <div className="shop-container">
                <div className="panel">
                    <div className="panel-header">
                        <h2>🏪 Shop</h2>
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ New Item'}
                        </button>
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

                <div className="shop-items-grid">
                    {shopItems.filter(item => item.visible).map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            userProfile={userProfile}
                            onPurchase={handlePurchase}
                            onEdit={handleEditItem}
                            onDelete={onDeleteShopItem}
                        />
                    ))}
                    {shopItems.filter(item => item.visible).length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🛒</div>
                            <p>No items available yet. Add some rewards to shop for!</p>
                        </div>
                    )}
                </div>
            </div>
            );
};

            const ShopItemCard = ({item, userProfile, onPurchase, onEdit, onDelete}) => {
  const canAfford = userProfile.coins >= item.cost;

            return (
            <div className="shop-item-card card-appear">
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
                    <button className="btn btn-sm" onClick={() => onDelete(item.id)}>
                        🗑
                    </button>
                </div>
            </div>
            );
};

            export default Shop;
