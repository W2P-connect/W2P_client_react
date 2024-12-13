import { useAppDataContext } from '_CONTEXT/hook/contextHook'
import { appDataStore } from '_STORES/AppData'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { translate } from 'translation'

const SaveSettinsButton = () => {

    const { saveParameters } = useAppDataContext()

    return (
        <form onSubmit={e =>
            saveParameters(e, true)
        }>
            <button
                className='strong-button'
                style={{
                    opacity: JSON.stringify(appDataStore.initAppData.parameters) !==
                        JSON.stringify((appDataStore.getAppData().parameters)) ? 1 : 0

                }}
            >
                {translate("Save settings")}
            </button>
        </form>)
}

export default observer(SaveSettinsButton)