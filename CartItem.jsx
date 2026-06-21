
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity } from "../redux/CartSlice";
import "./CartItem.css";

const nurseryBusinessRules = {
    maxQuantityPerPlant: 20,
    minQuantityPerPlant: 1,
    bulkDiscountThreshold: 5,
    bulkDiscountRate: 0.1,
    seasonalBoost: true,
    taxRate: 0.07,
    currency: "USD"
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const calculateBulkDiscount = (price, qty) => {
    if (qty >= nurseryBusinessRules.bulkDiscountThreshold) {
        return price * qty * nurseryBusinessRules.bulkDiscountRate;
    }
    return 0;
};

const calculateTax = (amount) => amount * nurseryBusinessRules.taxRate;

const generatePlantCareLevel = (category) => {
    switch (category) {
        case "Indoor Plants":
            return "Easy Care 🌿";
        case "Medicinal Plants":
            return "Medium Care 🌱";
        case "Flowering Plants":
            return "High Attention 🌸";
        default:
            return "Standard Care 🌿";
    }
};

const CartItem = ({ item }) => {
    const dispatch = useDispatch();

    const [quantity, setQuantity] = useState(item.quantity || 1);
    const [expanded, setExpanded] = useState(false);
    const [warning, setWarning] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const cartMeta = useSelector((state) => state.cart);

    const validateQuantity = useCallback((qty) => {
        if (qty > nurseryBusinessRules.maxQuantityPerPlant) {
            return `Maximum ${nurseryBusinessRules.maxQuantityPerPlant} allowed per plant 🌿`;
        }
        if (qty < nurseryBusinessRules.minQuantityPerPlant) {
            return `Minimum ${nurseryBusinessRules.minQuantityPerPlant} required 🌱`;
        }
        return "";
    }, []);


    const updateCartQuantity = (newQty) => {
        const error = validateQuantity(newQty);

        if (error) {
            setWarning(error);
            return;
        }

        setWarning("");
        setQuantity(newQty);
        dispatch(updateQuantity({ id: item.id, quantity: newQty }));
    };

    const handleIncrease = () => {
        updateCartQuantity(quantity + 1);
    };

    const handleDecrease = () => {
        updateCartQuantity(quantity - 1);
    };

    const handleManualInput = (e) => {
        const value = parseInt(e.target.value || 1);
        updateCartQuantity(value);
    };

    const handleRemove = () => {
        dispatch(removeItem(item.id));
    };

    const pricing = useMemo(() => {
        const base = item.price * quantity;
        const discount = calculateBulkDiscount(item.price, quantity);
        const tax = calculateTax(base - discount);
        const total = base - discount + tax;

        return {
            base,
            discount,
            tax,
            total
        };
    }, [item.price, quantity]);

    const careLevel = useMemo(() => {
        return generatePlantCareLevel(item.category);
    }, [item.category]);

    useEffect(() => {
        console.log("🌿 Cart Item Updated:", {
            id: item.id,
            quantity,
            total: pricing.total
        });
    }, [quantity]);

    return (
        <div className="cart-item-container">

            <div className="cart-header">

                <div className="cart-title">
                    <h2>🌿 {item.name}</h2>
                    <p className="category">{item.category}</p>
                    <span className="care-level">{careLevel}</span>
                </div>

                <div className="price-box">
                    <h3>{formatCurrency(item.price)}</h3>
                </div>

            </div>

            {warning && (
                <div className="warning-box">
                    ⚠️ {warning}
                </div>
            )}

            <div className="quantity-box">

                <button onClick={handleDecrease}>➖</button>

                <input
                    type="number"
                    value={quantity}
                    onChange={handleManualInput}
                />

                <button onClick={handleIncrease}>➕</button>

            </div>

            <div className="pricing-section">

                <p>Base: {formatCurrency(pricing.base)}</p>
                <p>Discount: -{formatCurrency(pricing.discount)}</p>
                <p>Tax: +{formatCurrency(pricing.tax)}</p>

                <h3 className="total">
                    Total: {formatCurrency(pricing.total)}
                </h3>

            </div>

            <div className="expand-section">

                <button onClick={() => setExpanded(!expanded)}>
                    {expanded ? "Hide Details 🔼" : "View Full Plant Intelligence 🔽"}
                </button>

                {expanded && (
                    <div className="details-panel">

                        <p>🌱 Plant ID: {item.id}</p>
                        <p>🌿 Category: {item.category}</p>
                        <p>💧 Water Requirement: Medium</p>
                        <p>☀️ Sunlight: Balanced Exposure</p>
                        <p>📦 Stock: Available in Nursery Warehouse</p>

                        <p>📊 Bulk Discount Eligible: {quantity >= 5 ? "YES" : "NO"}</p>

                        <p className="note">
                            🌿 45+ years horticulture intelligence system applied for optimal plant handling
                        </p>

                    </div>
                )}

            </div>

            <div className="action-buttons">

                <button className="remove-btn" onClick={handleRemove}>
                    ❌ Remove Plant
                </button>

                <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                    ✏️ {isEditing ? "Stop Editing" : "Edit Mode"}
                </button>

            </div>

            <div className="footer-info">
                <small>
                    🌿 Paradise Nursery Enterprise System | 45+ Years Expertise Engine
                </small>
            </div>

        </div>
    );
};

export default CartItem;