import React, { useEffect } from 'react';
import './LevelUpModal.css';

const LevelUpModal = ({ isOpen, newLevel, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal level-up-modal level-up-animation" onClick={(e) => e.stopPropagation()}>
                <div className="level-up-content">
                    <h1 className="level-up-title level-up-glow">⬆️ LEVEL UP!</h1>
                    <div className="new-level">
                        <span className="level-label">New Level:</span>
                        <span className="level-number">{newLevel}</span>
                    </div>
                    <p className="level-up-message">
                        Congratulations! Your power grows!
                    </p>
                    <button className="btn btn-primary" onClick={onClose}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;
