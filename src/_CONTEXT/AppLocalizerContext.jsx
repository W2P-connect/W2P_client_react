import React, { createContext, useContext } from 'react';

const AppLocalizerContext = createContext(null);

export const AppLocalizerProvider = ({ children, value }) => (
    <AppLocalizerContext.Provider value={value}>
        {children}
    </AppLocalizerContext.Provider>
);


export const useAppLocalizer = () => {
    return useContext(AppLocalizerContext);
};
