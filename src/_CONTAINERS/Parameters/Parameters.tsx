import React, { useContext, useEffect } from 'react'
import { translate } from '../../translation'
import NavBar, { Item } from '../../_COMPONENTS/NAVIGATION/NavBar/NavBar'
import { MenuContext } from '../../_CONTEXT/MenuContext'
import SaveSettinsButton from './SaveSettinsButton'
import { appDataStore } from '_STORES/AppData'


export default function Parameters() {

  const { currentSubMenu, currentSubMenuContent, setCurrentSubMenuPage } = useContext(MenuContext)

  useEffect(() => {
    if (!currentSubMenu) {
      setCurrentSubMenuPage('general') //Page par défaut
    }
  }, [currentSubMenu, setCurrentSubMenuPage])

  const parametersItems = [
    {
      label: translate("General"),
      onClick: (item: Item) => setCurrentSubMenuPage(item.value),
      active: currentSubMenu === "general",
      value: "general",
    },
    {
      label: translate("Persons"),
      onClick: (item: Item) => setCurrentSubMenuPage(item.value),
      active: currentSubMenu === "persons",
      value: "persons",
    },
    {
      label: translate("Organizations"),
      onClick: (item: Item) => setCurrentSubMenuPage(item.value),
      active: currentSubMenu === "organizations",
      value: "organizations",
    },
  ]

  if (appDataStore.appData.CONSTANTES.W2PCIFW_IS_WOOCOMERCE_ACTIVE) {
    parametersItems.push({
      label: translate("Deals"),
      onClick: (item: Item) => setCurrentSubMenuPage(item.value),
      active: currentSubMenu === "deals",
      value: "deals",
    })
  }
  
  return (
    <div>
      {currentSubMenu && <NavBar items={parametersItems} />}
      {currentSubMenuContent}

      <div className='right-0 bottom-0 fixed p-5'>
        <SaveSettinsButton />
      </div>
    </div >
  )
}