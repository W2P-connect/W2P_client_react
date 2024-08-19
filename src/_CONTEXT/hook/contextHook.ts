import { useContext } from 'react';
import { AppDataContextType, AppDataContext } from '../appDataContext';
import { NotificationContext, NotificationContextType } from '_CONTEXT/NotificationContext';

export const useAppDataContext = (): AppDataContextType => {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppDataContext must be used within an AppDataContextProvider');
    }
    return context;
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationContextProvider");
    }
    return context;
};
