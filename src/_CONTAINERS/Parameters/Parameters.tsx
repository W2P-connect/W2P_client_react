import React, { useContext, useEffect } from 'react'
import { translate } from '../../translation'
import NavBar, { Item } from '../../_COMPONENTS/NAVIGATION/NavBar/NavBar'
import { MenuContext } from '../../_CONTEXT/MenuContext'
import { useAppDataContext } from '_CONTEXT/hook/contextHook'


export default function Parameters() {

  const { saveParameters, apiTest } = useAppDataContext()
  const { currentSubMenu, currentSubMenuContent, setCurrentSubMenuPage } = useContext(MenuContext)

  useEffect(() => {
    console.log(currentSubMenu);

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
    {
      label: translate("Deals"),
      onClick: (item: Item) => setCurrentSubMenuPage(item.value),
      active: currentSubMenu === "deals",
      value: "deals",
    },
  ]

  return (
    <div>
      {/* <h1>{translate("Parameters")}</h1> */}
      {currentSubMenu && <NavBar items={parametersItems} />}
      {currentSubMenuContent}

      <div className='fixed bottom-0 right-0 p-5'>
        <form onSubmit={e =>
          saveParameters(e, true)
        }>
          <button
            className='strong-button'
          >
            {translate("Save settings")}
          </button>
        </form>
      </div>
    </div >
  )
}