import React, { createContext, useContext } from 'react';
import { AppData } from '../Types';


const AppLocalizerContext = createContext<AppData | null>(null);

export const AppLocalizerProvider = ({ children, value }: { children: React.ReactNode; value: AppData }) => (
    <AppLocalizerContext.Provider value={value}>
        {children}
    </AppLocalizerContext.Provider>
);

export const useAppLocalizer = () => {
    const context = useContext(AppLocalizerContext);
    if (!context) {
        throw new Error("useAppLocalizer must be used within an AppLocalizerProvider");
    }
    return context;
};
