import React, { useContext, useEffect } from 'react'
import { translate } from '../../translation'
import NavBar from '../../_COMPONENTS/NAVIGATION/NavBar/NavBar'
import { MenuContext } from '../../_CONTEXT/MenuContext'
import { useAppDataContext } from '_CONTEXT/hook/contextHook'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'
import { toJS } from 'mobx'

const Parameters = () => {

  const { saveParameters, apiTest } = useAppDataContext()
  const { currentSubMenu, currentSubMenuContent, setCurrentSubMenuPage } = useContext(MenuContext)

  // const disableSaveParameters = useMemo(() =>
  //   JSON.stringify(formatParameters(appDataInit.parameters)) === JSON.stringify(formatParameters(appData.parameters))
  //   , [appDataInit, appData]
  // )

  useEffect(() => {
    if (!currentSubMenu) {
      setCurrentSubMenuPage('general') //Page par défaut
    }
  }, [currentSubMenu, setCurrentSubMenuPage])

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

  const disableSaveParameters = (
    JSON.stringify(appDataStore.initAppData.parameters) ===
    JSON.stringify((appDataStore.getAppData().parameters))
  )


  return (
    <div>
      {/* <h1>{translate("Parameters")}</h1> */}
      {currentSubMenu && <NavBar items={parametersItems} />}
      {currentSubMenuContent}

      <div className='nav-bottom-section'>
        <form onSubmit={e =>
          apiTest(e)
        }>
          <button
            className='strong-button m-r-10'
          >
            {translate("API Test")}
          </button>
        </form>
        <form onSubmit={e =>
          saveParameters(e, true)
        }>
          <button
            className='strong-button'
            disabled={disableSaveParameters}
            style={{
              opacity: disableSaveParameters
                ? 0.8
                : 1,
              cursor: disableSaveParameters
                ? 'default'
                : 'pointer'
            }}
          >
            {translate("Save settings")}
          </button>
        </form>
      </div>
    </div >
  )
}

export default observer(Parameters)