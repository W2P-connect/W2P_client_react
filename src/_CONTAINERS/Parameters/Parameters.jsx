import React, { useContext, useEffect } from 'react'
import { translate } from '../../translation'
import NavBar from '../../_COMPONENTS/NAVIGATION/NavBar/NavBar'
import { AppDataContext } from '../../_CONTEXT/appDataContext'
import { MenuContext } from '../../_CONTEXT/MenuContext'

export default function Parameters() {

  const { saveParameters, apiTest } = useContext(AppDataContext)
  const { currentSubMenu, currentSubMenuContent, setCurrentSubMenuPage } = useContext(MenuContext)

  useEffect(() => {
    if (!currentSubMenu) {
      setCurrentSubMenuPage('general') //Page par défaut
    }
  }, [])

  const parametersItems = [
    {
      label: translate("General"),
      onClick: setCurrentSubMenuPage,
      active: currentSubMenu === "general",
      value: "general",
    },
    {
      label: translate("Persons"),
      onClick: setCurrentSubMenuPage,
      active: currentSubMenu === "persons",
      value: "persons",
    },
    {
      label: translate("Organizations"),
      onClick: setCurrentSubMenuPage,
      active: currentSubMenu === "organizations",
      value: "organizations",
    },
    {
      label: translate("Deals"),
      onClick: setCurrentSubMenuPage,
      active: currentSubMenu === "deals",
      value: "deals",
    },
  ]

  return (
    <div>
      {/* <h1>{translate("Parameters")}</h1> */}
      {currentSubMenu && <NavBar items={parametersItems} />}
      {currentSubMenuContent}

      <div className='nav-bottom-section'>
        <button
          onClick={e => apiTest(e)}
          type='button'
          className='strong-button m-r-10'
        >
          {translate("API Test")}
        </button>
        <button
          onClick={e => saveParameters(e)}
          type='button'
          className='strong-button'
        >
          {translate("Save settings")}
        </button>
      </div>
    </div >
  )
}
