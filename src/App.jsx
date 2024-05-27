import React, { useContext } from 'react';
import './index.css';
import Popup from './_COMPONENTS/GENERAL/Popup/Popup';
import { MenuContext } from './_CONTEXT/MenuContext';
import MainMenu from './_COMPONENTS/NAVIGATION/MainMenu/MainMenu';
import Notifications from './_COMPONENTS/GENERAL/Notification/Notifications';

function App() {
  const { menuContent } = useContext(MenuContext);

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

export default App;