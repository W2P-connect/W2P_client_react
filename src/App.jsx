import React, { useContext, useEffect } from 'react';
import './index.css';
import Popup from './_COMPONENTS/GENERAL/Popup/Popup';
import { MenuContext } from './_CONTEXT/MenuContext';
import MainMenu from './_COMPONENTS/NAVIGATION/MainMenu/MainMenu';
import Notifications from './_COMPONENTS/GENERAL/Notification/Notifications';
import { observer } from 'mobx-react-lite';
import { appDataStore } from '_STORES/AppData';

function App() {
  const { menuContent } = useContext(MenuContext);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (
        JSON.stringify(appDataStore.initAppData.parameters) !==
        JSON.stringify((appDataStore.getAppData().parameters))
      ) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  return (
    <div className="App">
      <MainMenu />
      <div className='w2p-app-content'>
        {menuContent}
      </div>
      <Popup />
      <Notifications />
    </div >
  );
}

export default observer(App);