import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {notifications.map(n => (
                        <Notification toast={n} key={n.id} onClose={() => removeNotification(n.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

const Notification = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-secondary" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-400" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="flex items-center gap-3 min-w-[300px] p-4 rounded-xl bg-[#1e293b]/90 backdrop-blur-md border border-white/10 shadow-lg"
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};
