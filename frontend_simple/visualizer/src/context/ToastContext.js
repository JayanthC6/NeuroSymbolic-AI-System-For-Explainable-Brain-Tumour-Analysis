import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Improvements:
// 1. Accessibility: role="alert", live region
// 2. Animation: Slide in/out
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        role="alert"
                        className={`
              pointer-events-auto px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 transition-all
              ${toast.type === 'error' ? 'bg-red-500 text-white' :
                                toast.type === 'success' ? 'bg-emerald-500 text-white' :
                                    'bg-slate-800 text-white border border-slate-700'}
            `}
                    >
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 opacity-70 hover:opacity-100 font-bold"
                            aria-label="Close notification"
                        >✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
