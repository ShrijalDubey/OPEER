import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

const ToastContext = createContext();

let toastId = 0;

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);
    const confirmResolveRef = useRef(null);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
        }, duration);
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);
    const warn = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            confirmResolveRef.current = resolve;
            setConfirmModal(message);
        });
    }, []);

    const handleConfirm = (result) => {
        setConfirmModal(null);
        if (confirmResolveRef.current) {
            confirmResolveRef.current(result);
            confirmResolveRef.current = null;
        }
    };

    return (
        <ToastContext.Provider value={{ success, error, info, warn, confirm }}>
            {children}

            {/* Toast Stack */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
                    >
                        <span className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✕'}
                            {toast.type === 'info' && 'ℹ'}
                            {toast.type === 'warning' && '⚠'}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="confirm-overlay" onClick={() => handleConfirm(false)}>
                    <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                        <p className="confirm-message">{confirmModal}</p>
                        <div className="confirm-actions">
                            <button className="confirm-yes" onClick={() => handleConfirm(true)}>
                                Confirm
                            </button>
                            <button className="confirm-no" onClick={() => handleConfirm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
